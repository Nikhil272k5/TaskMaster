import sqlite3
from typing import Optional


def get_graph_data(conn, limit: int = 200, search: str = None):
    nodes = []
    links = []
    node_ids = set()

    def add_node(node_id, label, node_type, color, props=None):
        if node_id and node_id not in node_ids:
            node_ids.add(node_id)
            nodes.append({
                "id": str(node_id),
                "label": str(label),
                "type": node_type,
                "color": color,
                "props": props or {}
            })

    def add_link(source, target, rel_type=""):
        s, t = str(source), str(target)
        if s and t and s in node_ids and t in node_ids and s != t:
            links.append({"source": s, "target": t, "type": rel_type})

    cur = conn.cursor()

    # --- SALES ORDERS ---
    cur.execute("""
        SELECT salesOrder, salesOrderType, soldToParty, totalNetAmount,
               overallDeliveryStatus, overallOrdReltdBillgStatus,
               transactionCurrency, creationDate
        FROM sales_order_headers
        ORDER BY creationDate DESC
        LIMIT ?
    """, (limit,))
    sales_orders = cur.fetchall()
    for r in sales_orders:
        add_node(r["salesOrder"], f"SO-{r['salesOrder']}", "SalesOrder", "#4A90D9", {
            "Type": r["salesOrderType"],
            "Customer": r["soldToParty"],
            "Amount": r["totalNetAmount"],
            "Currency": r["transactionCurrency"],
            "DelivStatus": r["overallDeliveryStatus"],
            "BillStatus": r["overallOrdReltdBillgStatus"],
            "Created": (r["creationDate"] or "")[:10]
        })

    so_ids = [r["salesOrder"] for r in sales_orders]
    if not so_ids:
        return {"nodes": nodes, "links": links}

    placeholders = ",".join("?" * len(so_ids))

    # --- CUSTOMERS ---
    cur.execute("""
        SELECT DISTINCT soh.soldToParty, bp.businessPartnerFullName,
               bp.businessPartnerName, bp.industry, bpa.country, bpa.cityName
        FROM sales_order_headers soh
        LEFT JOIN business_partners bp ON soh.soldToParty = bp.customer
        LEFT JOIN business_partner_addresses bpa ON bp.businessPartner = bpa.businessPartner
        WHERE soh.salesOrder IN ({})
        GROUP BY soh.soldToParty
    """.format(placeholders), so_ids)
    for r in cur.fetchall():
        cid = r["soldToParty"]
        name = r["businessPartnerFullName"] or r["businessPartnerName"] or cid
        add_node(cid, f"CUST-{cid}", "Customer", "#9B59B6", {
            "Name": name, "Industry": r["industry"],
            "Country": r["country"], "City": r["cityName"]
        })
    for r in sales_orders:
        add_link(r["salesOrder"], r["soldToParty"], "SOLD_TO")

    # --- DELIVERIES via outbound_delivery_items.referenceSdDocument ---
    # referenceSdDocument stores the SO number (6-digit)
    cur.execute("""
        SELECT DISTINCT odi.referenceSdDocument AS soId,
               odi.deliveryDocument,
               dh.creationDate, dh.actualGoodsMovementDate,
               dh.overallGoodsMovementStatus, dh.shippingPoint
        FROM outbound_delivery_items odi
        JOIN outbound_delivery_headers dh ON odi.deliveryDocument = dh.deliveryDocument
        WHERE odi.referenceSdDocument IN ({})
          AND odi.deliveryDocument IS NOT NULL AND odi.deliveryDocument != ''
    """.format(placeholders), so_ids)
    delivery_rows = cur.fetchall()
    for r in delivery_rows:
        add_node(r["deliveryDocument"], f"DEL-{r['deliveryDocument']}", "Delivery", "#7ED321", {
            "GoodsMovement": (r["actualGoodsMovementDate"] or "")[:10],
            "Status": r["overallGoodsMovementStatus"],
            "ShippingPt": r["shippingPoint"]
        })
    for r in delivery_rows:
        add_link(r["soId"], r["deliveryDocument"], "HAS_DELIVERY")

    del_ids = list({r["deliveryDocument"] for r in delivery_rows if r["deliveryDocument"]})

    # --- PLANTS from delivery items ---
    if del_ids:
        del_ph = ",".join("?" * len(del_ids))
        cur.execute("""
            SELECT DISTINCT odi.deliveryDocument, odi.plant, p.plantName, p.salesOrganization
            FROM outbound_delivery_items odi
            LEFT JOIN plants p ON odi.plant = p.plant
            WHERE odi.deliveryDocument IN ({}) AND odi.plant IS NOT NULL AND odi.plant != ''
        """.format(del_ph), del_ids)
        for r in cur.fetchall():
            add_node(r["plant"], f"PLT-{r['plant']}", "Plant", "#E74C3C", {
                "Name": r["plantName"], "SalesOrg": r["salesOrganization"]
            })
            add_link(r["deliveryDocument"], r["plant"], "DELIVERS_TO")

    # --- BILLING DOCUMENTS
    # billing_document_items.salesDocument is the DELIVERY DOCUMENT number (8-digit)
    # So we join: billing items → delivery items → SO via referenceSdDocument
    if del_ids:
        del_ph = ",".join("?" * len(del_ids))
        cur.execute("""
            SELECT DISTINCT bdh.billingDocument, bdh.billingDocumentType,
                   bdh.totalNetAmount, bdh.transactionCurrency,
                   bdh.billingDocumentIsCancelled, bdh.accountingDocument,
                   bdh.companyCode, bdi.salesDocument AS delivDoc,
                   odi.referenceSdDocument AS soId
            FROM billing_document_headers bdh
            JOIN billing_document_items bdi ON bdh.billingDocument = bdi.billingDocument
            JOIN outbound_delivery_items odi ON bdi.salesDocument = odi.deliveryDocument
            WHERE bdi.salesDocument IN ({})
        """.format(del_ph), del_ids)
        billing_rows = cur.fetchall()
        for r in billing_rows:
            add_node(r["billingDocument"], f"BILL-{r['billingDocument']}", "Billing", "#F5A623", {
                "Type": r["billingDocumentType"],
                "Amount": r["totalNetAmount"],
                "Currency": r["transactionCurrency"],
                "Cancelled": bool(r["billingDocumentIsCancelled"]),
                "Company": r["companyCode"]
            })
        for r in billing_rows:
            # Link billing to delivery doc
            add_link(r["delivDoc"], r["billingDocument"], "BILLED_AS")

        bill_ids = list({r["billingDocument"] for r in billing_rows if r["billingDocument"]})

        # --- JOURNAL ENTRIES ---
        if bill_ids:
            bill_ph = ",".join("?" * len(bill_ids))
            cur.execute("""
                SELECT DISTINCT bdh.billingDocument, bdh.accountingDocument,
                       ji.glAccount, ji.amountInTransactionCurrency, ji.postingDate, ji.fiscalYear
                FROM billing_document_headers bdh
                JOIN journal_entry_items ji ON bdh.accountingDocument = ji.accountingDocument
                WHERE bdh.billingDocument IN ({})
                  AND bdh.accountingDocument IS NOT NULL AND bdh.accountingDocument != ''
            """.format(bill_ph), bill_ids)
            for r in cur.fetchall():
                add_node(r["accountingDocument"], f"JE-{r['accountingDocument']}", "JournalEntry", "#95A5A6", {
                    "GLAccount": r["glAccount"],
                    "Amount": r["amountInTransactionCurrency"],
                    "PostingDate": (r["postingDate"] or "")[:10],
                    "FiscalYear": r["fiscalYear"]
                })
                add_link(r["billingDocument"], r["accountingDocument"], "POSTED_TO")

    # --- PRODUCTS from sales order items ---
    cur.execute("""
        SELECT DISTINCT soi.salesOrder, soi.material,
               pd.productDescription, p.baseUnit, p.productType
        FROM sales_order_items soi
        LEFT JOIN products p ON soi.material = p.product
        LEFT JOIN product_descriptions pd ON soi.material = pd.product AND pd.language = 'EN'
        WHERE soi.salesOrder IN ({}) AND soi.material IS NOT NULL AND soi.material != ''
    """.format(placeholders), so_ids)
    product_rows = cur.fetchall()
    for r in product_rows:
        add_node(r["material"], r["productDescription"] or f"PROD-{r['material']}", "Product", "#1ABC9C", {
            "ID": r["material"],
            "Description": r["productDescription"],
            "Unit": r["baseUnit"],
            "Type": r["productType"]
        })
    for r in product_rows:
        add_link(r["salesOrder"], r["material"], "CONTAINS")

    return {"nodes": nodes, "links": links}


def get_node_detail(conn, node_id: str, node_type: str):
    cur = conn.cursor()
    result = {"id": node_id, "type": node_type, "props": {}}

    type_queries = {
        "SalesOrder": "SELECT * FROM sales_order_headers WHERE salesOrder=?",
        "Delivery": "SELECT * FROM outbound_delivery_headers WHERE deliveryDocument=?",
        "Billing": "SELECT * FROM billing_document_headers WHERE billingDocument=?",
        "Customer": """SELECT bp.*, bpa.cityName, bpa.country, bpa.region
                       FROM business_partners bp
                       LEFT JOIN business_partner_addresses bpa ON bp.businessPartner=bpa.businessPartner
                       WHERE bp.customer=?""",
        "Product": """SELECT p.*, pd.productDescription
                      FROM products p
                      LEFT JOIN product_descriptions pd ON p.product=pd.product AND pd.language='EN'
                      WHERE p.product=?""",
        "Plant": "SELECT * FROM plants WHERE plant=?",
        "JournalEntry": "SELECT * FROM journal_entry_items WHERE accountingDocument=? LIMIT 1",
    }

    if node_type in type_queries:
        cur.execute(type_queries[node_type], (node_id,))
        row = cur.fetchone()
        if row:
            result["props"] = dict(row)

    return result


def get_stats(conn):
    cur = conn.cursor()
    stats = {}
    tables = {
        "sales_orders": "SELECT COUNT(*) FROM sales_order_headers",
        "deliveries": "SELECT COUNT(*) FROM outbound_delivery_headers",
        "billing_docs": "SELECT COUNT(*) FROM billing_document_headers",
        "customers": "SELECT COUNT(DISTINCT soldToParty) FROM sales_order_headers",
        "products": "SELECT COUNT(*) FROM products",
        "plants": "SELECT COUNT(*) FROM plants",
        "journal_entries": "SELECT COUNT(DISTINCT accountingDocument) FROM journal_entry_items",
        "payments": "SELECT COUNT(*) FROM payments_accounts_receivable",
        "cancellations": "SELECT COUNT(*) FROM billing_document_cancellations",
    }
    for key, query in tables.items():
        try:
            cur.execute(query)
            stats[key] = cur.fetchone()[0]
        except Exception:
            stats[key] = 0
    return stats
