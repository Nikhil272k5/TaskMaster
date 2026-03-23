import json
import re
import sqlite3
from typing import Optional, List, Dict, Any

from guardrails import is_domain_query, REJECTION_MESSAGE
from llm import LLMClient

DB_SCHEMA = """
TABLES AND KEY COLUMNS:

1. sales_order_headers: salesOrder(PK), salesOrderType, soldToParty, totalNetAmount, 
   overallDeliveryStatus, overallOrdReltdBillgStatus, transactionCurrency, creationDate,
   requestedDeliveryDate, deliveryBlockReason, headerBillingBlockReason, customerPaymentTerms

2. sales_order_items: salesOrder+salesOrderItem(PK), material, requestedQuantity,
   netAmount, materialGroup, productionPlant, storageLocation

3. sales_order_schedule_lines: salesOrder+salesOrderItem+scheduleLineNumber(PK),
   deliveryDocument, deliveryDocumentItem, scheduledQuantity, deliveredQuantityInBaseUnit

4. outbound_delivery_headers: deliveryDocument(PK), creationDate, actualGoodsMovementDate,
   overallGoodsMovementStatus, overallPickingStatus, shippingPoint, deliveryBlockReason

5. outbound_delivery_items: deliveryDocument+deliveryDocumentItem(PK), plant,
   actualDeliveryQuantity, referenceSdDocument, referenceSdDocumentItem

6. billing_document_headers: billingDocument(PK), billingDocumentType, soldToParty,
   totalNetAmount, transactionCurrency, billingDocumentIsCancelled, accountingDocument,
   companyCode, fiscalYear, creationDate

7. billing_document_items: billingDocument+billingDocumentItem(PK), salesDocument,
   salesDocumentItem, material, billingQuantity, netAmount, plant

8. billing_document_cancellations: billingDocument(PK), billingDocumentType,
   cancelledBillingDocument, totalNetAmount, soldToParty

9. journal_entry_items: companyCode+fiscalYear+accountingDocument+accountingDocumentItem(PK),
   glAccount, referenceDocument, amountInTransactionCurrency, postingDate, customer,
   financialAccountType, clearingDate

10. payments_accounts_receivable: companyCode+fiscalYear+accountingDocument+accountingDocumentItem(PK),
    customer, invoiceReference, salesDocument, amountInTransactionCurrency, clearingDate, postingDate

11. business_partners: businessPartner(PK), customer, businessPartnerFullName,
    businessPartnerName, industry

12. business_partner_addresses: businessPartner+addressId(PK), cityName, country, region

13. customer_company_assignments: customer+companyCode(PK), paymentTerms, reconciliationAccount

14. customer_sales_area_assignments: customer+salesOrganization+distributionChannel+division(PK),
    currency, customerPaymentTerms, deliveryPriority, supplyingPlant

15. products: product(PK), productType, baseUnit, productGroup, division

16. product_descriptions: product+language(PK), productDescription

17. product_plants: product+plant(PK), profitCenter

18. product_storage_locations: product+plant+storageLocation(PK)

19. plants: plant(PK), plantName, salesOrganization

KEY RELATIONSHIPS:
- sales_order_headers.soldToParty = business_partners.customer
- sales_order_schedule_lines.deliveryDocument = outbound_delivery_headers.deliveryDocument
- billing_document_items.salesDocument = sales_order_headers.salesOrder
- billing_document_headers.accountingDocument = journal_entry_items.accountingDocument
- billing_document_headers.billingDocument = journal_entry_items.referenceDocument
- sales_order_items.material = products.product
- outbound_delivery_items.plant = plants.plant
- business_partners.businessPartner = business_partner_addresses.businessPartner
"""

HIGHLIGHTED_COLUMNS = [
    "salesOrder", "deliveryDocument", "billingDocument",
    "businessPartner", "product", "material", "plant", "customer",
    "accountingDocument", "invoiceReference"
]


class SQLAgent:
    def __init__(self, db, llm: LLMClient):
        self.db = db
        self.llm = llm

    def generate_sql_and_intent(self, question: str, history: List[Dict] = None) -> Dict:
        history_text = ""
        if history:
            recent = history[-6:]
            history_text = "\n\nPrevious conversation:\n" + "\n".join(
                f"{m['role'].upper()}: {m['content'][:200]}" for m in recent
            )

        system_prompt = f"""You are a senior AI database engineer for a SAP Order-to-Cash SQLite system.
Your task is to understand the user intent, identify entities, and write precise SQL.

{DB_SCHEMA}

CLASSIFY INTENT AS ONE OF:
- "aggregation": queries about highest, count, total, top
- "flow": tracing the full document flow or path
- "anomaly": missing documents, not billed, incomplete, broken flows
- "lookup": find, show, list specific details

STRICT RULES:
1. ONLY use tables and columns listed in the schema.
2. For "delivered but not billed", LEFT JOIN billing_document_headers ON deliveryDocument and check IS NULL.
3. For "trace full flow", JOIN sales_order_headers → outbound_delivery_headers → billing_document_headers → journal_entry_items.
4. For aggregations (e.g., "highest billing products"), use GROUP BY and ORDER BY DESC LIMIT 1.
5. ALWAYS output valid JSON EXACTLY matching this schema:
{{
  "intent": "aggregation|flow|anomaly|lookup",
  "entities": ["list of entities"],
  "sql": "valid sqlite SQL query",
  "explanation": "brief technical explanation of the SQL"
}}
6. DO NOT wrap JSON in markdown block. Return raw JSON.
{history_text}"""

        user_prompt = f"Question: {question}"
        raw_response = self.llm.call(system_prompt, user_prompt)
        
        # Clean JSON
        raw_response = raw_response.strip()
        raw_response = re.sub(r"```json\s*", "", raw_response, flags=re.IGNORECASE)
        raw_response = re.sub(r"```\s*", "", raw_response)
        
        try:
            parsed = json.loads(raw_response)
            return parsed
        except json.JSONDecodeError:
            # Fallback if LLM failed JSON
            return {
                "intent": "lookup",
                "entities": [],
                "sql": raw_response.strip(),
                "explanation": "Fallback execution"
            }

    def validate_sql(self, sql: str) -> bool:
        """Pre-flight validation using SQLite EXPLAIN. Checks tables/columns."""
        if not sql:
            return False, "Empty SQL query."
        cur = self.db.cursor()
        try:
            cur.execute(f"EXPLAIN QUERY PLAN {sql}")
            return True, None
        except Exception as e:
            return False, str(e)

    def execute_sql(self, sql: str) -> List[Dict]:
        cur = self.db.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def extract_highlighted_nodes(self, rows: List[Dict]) -> List[str]:
        highlighted = []
        seen = set()
        for row in rows:
            for col in HIGHLIGHTED_COLUMNS:
                val = row.get(col) or row.get(col.lower())
                if val and str(val) not in seen:
                    seen.add(str(val))
                    highlighted.append(str(val))
        return highlighted[:20]

    def execute_and_explain(self, question: str, history: List[Dict] = None) -> Dict[str, Any]:
        # 1. Guardrail check
        if not is_domain_query(question, self.llm):
            return {
                "answer": REJECTION_MESSAGE,
                "sql": None,
                "data": None,
                "row_count": 0,
                "highlighted_nodes": []
            }

        # 2. Generate and Validate SQL
        sql = None
        rows = []
        error_msg = None
        intent_data = {}
        
        try:
            intent_data = self.generate_sql_and_intent(question, history)
            sql = intent_data.get("sql", "")
            
            # Validation Step
            is_valid, val_error = self.validate_sql(sql)
            if not is_valid:
                raise Exception(f"Validation failed: {val_error}")
                
            rows = self.execute_sql(sql)
        except Exception as e:
            error_msg = str(e)
            # Retry mechanism
            try:
                retry_prompt = f"{question}\n\nWARNING: Previous SQL '{sql}' failed with error: {error_msg}\nFix the SQL carefully."
                intent_data = self.generate_sql_and_intent(retry_prompt, history)
                sql = intent_data.get("sql", "")
                is_valid, val_error = self.validate_sql(sql)
                if not is_valid:
                    raise Exception(f"Retry validation failed: {val_error}")
                rows = self.execute_sql(sql)
                error_msg = None
            except Exception as e2:
                error_msg = str(e2)

        # 3. Generate natural language answer
        if error_msg:
            answer = f"I encountered an error executing that query: {error_msg}. Please rephrase your question."
        elif not rows:
            answer = "No records found matching your query. The dataset may not contain data matching those criteria."
        else:
            system_prompt = (
                "You are a data analyst for SAP Order-to-Cash data. "
                "Summarize the SQL query results clearly and concisely. "
                "Be specific with numbers and IDs. Do not make up data. "
                "Keep the answer under 150 words."
            )
            user_prompt = (
                f"Question: {question}\n\n"
                f"SQL Results (first 20 rows):\n{json.dumps(rows[:20], indent=2)}\n\n"
                f"Total rows returned: {len(rows)}\n\n"
                "Provide a direct, helpful answer."
            )
            try:
                answer = self.llm.call(system_prompt, user_prompt)
            except Exception as e:
                answer = f"Found {len(rows)} records. Here are the top results: {json.dumps(rows[:5])}"

        highlighted = self.extract_highlighted_nodes(rows) if rows else []

        return {
            "answer": answer,
            "sql": sql,
            "data": rows,
            "row_count": len(rows),
            "highlighted_nodes": highlighted,
            "explanation": intent_data.get("explanation", "Executed SQL query against OTC data.")
        }
