import os
from dotenv import load_dotenv
load_dotenv()

DOMAIN_KEYWORDS = [
    "order", "delivery", "billing", "invoice", "payment", "customer", "product",
    "plant", "material", "sales", "journal", "accounting", "shipment", "dispatch",
    "revenue", "amount", "quantity", "status", "cancel", "flow", "trace", "track",
    "document", "o2c", "sap", "vendor", "partner", "business", "fiscal", "ledger",
    "item", "schedule", "distribution", "organization", "currency", "inr", "billing",
    "receivable", "clearing", "posting", "gl", "account", "profit", "center",
    "storage", "location", "picking", "goods", "movement", "shipped", "billed",
    "unbilled", "undelivered", "outstanding", "pending", "blocked", "credit",
    "total", "net", "gross", "weight", "unit", "description", "type", "date",
    "created", "company", "code", "address", "city", "country", "region"
]

REJECTION_MESSAGE = (
    "This system only answers dataset-related queries about the SAP Order-to-Cash process. "
    "I can help you analyze sales orders, deliveries, billing documents, payments, "
    "products, customers, and related business flows. "
    "Please ask a question related to this domain."
)


def is_domain_query(question: str, llm_client=None) -> bool:
    q_lower = question.lower()
    for kw in DOMAIN_KEYWORDS:
        if kw in q_lower:
            return True

    # LLM fallback classification
    if llm_client:
        try:
            system_prompt = (
                "You are a classifier. Answer ONLY 'YES' or 'NO'. "
                "Is the following question about business processes such as: "
                "SAP, Order-to-Cash, supply chain, sales orders, deliveries, billing, "
                "invoices, payments, products, customers, or inventory?"
            )
            response = llm_client.call(system_prompt, question)
            return "yes" in response.lower()
        except Exception:
            pass

    return False
