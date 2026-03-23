import json
import os
import sys
from pathlib import Path

# Add parent dir for imports
sys.path.insert(0, str(Path(__file__).parent))

from database import get_db, create_schema, DATABASE_PATH

# Path to dataset - two levels up from backend/
DATA_ROOT = Path(__file__).parent.parent.parent / "sap-o2c-data"
if not DATA_ROOT.exists():
    # Try relative to current working directory
    DATA_ROOT = Path("../sap-o2c-data")
if not DATA_ROOT.exists():
    DATA_ROOT = Path("../../sap-o2c-data")


def to_real(val):
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def to_int(val):
    if val is None or val == "":
        return None
    if isinstance(val, bool):
        return 1 if val else 0
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def read_jsonl_files(folder_path):
    records = []
    folder = Path(folder_path)
    if not folder.exists():
        return records
    for f in sorted(folder.glob("**/*.jsonl")):
        with open(f, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return records


def ingest_sales_order_headers(conn):
    records = read_jsonl_files(DATA_ROOT / "sales_order_headers")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO sales_order_headers
                (salesOrder, salesOrderType, salesOrganization, distributionChannel,
                 organizationDivision, soldToParty, creationDate, createdByUser,
                 totalNetAmount, overallDeliveryStatus, overallOrdReltdBillgStatus,
                 transactionCurrency, requestedDeliveryDate, headerBillingBlockReason,
                 deliveryBlockReason, customerPaymentTerms, totalCreditCheckStatus)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("salesOrder"), r.get("salesOrderType"), r.get("salesOrganization"),
                r.get("distributionChannel"), r.get("organizationDivision"), r.get("soldToParty"),
                r.get("creationDate"), r.get("createdByUser"),
                to_real(r.get("totalNetAmount")),
                r.get("overallDeliveryStatus"), r.get("overallOrdReltdBillgStatus"),
                r.get("transactionCurrency"), r.get("requestedDeliveryDate"),
                r.get("headerBillingBlockReason"), r.get("deliveryBlockReason"),
                r.get("customerPaymentTerms"), r.get("totalCreditCheckStatus")
            ))
            count += 1
        except Exception as e:
            pass
    conn.commit()
    return count


def ingest_sales_order_items(conn):
    records = read_jsonl_files(DATA_ROOT / "sales_order_items")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO sales_order_items
                (salesOrder, salesOrderItem, salesOrderItemCategory, material,
                 requestedQuantity, requestedQuantityUnit, netAmount, transactionCurrency,
                 materialGroup, productionPlant, storageLocation, itemBillingBlockReason)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("salesOrder"), r.get("salesOrderItem"), r.get("salesOrderItemCategory"),
                r.get("material"), to_real(r.get("requestedQuantity")),
                r.get("requestedQuantityUnit"), to_real(r.get("netAmount")),
                r.get("transactionCurrency"), r.get("materialGroup"),
                r.get("productionPlant"), r.get("storageLocation"),
                r.get("itemBillingBlockReason")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_sales_order_schedule_lines(conn):
    records = read_jsonl_files(DATA_ROOT / "sales_order_schedule_lines")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO sales_order_schedule_lines
                (salesOrder, salesOrderItem, scheduleLineNumber, requestedDeliveryDate,
                 scheduledQuantity, deliveredQuantityInBaseUnit, confdDelivQtyInOrderQtyUnit,
                 deliveryDocument, deliveryDocumentItem)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (
                r.get("salesOrder"), r.get("salesOrderItem"), r.get("scheduleLineNumber"),
                r.get("requestedDeliveryDate"),
                to_real(r.get("scheduledQuantity")),
                to_real(r.get("deliveredQuantityInBaseUnit")),
                to_real(r.get("confdDelivQtyInOrderQtyUnit")),
                r.get("deliveryDocument"), r.get("deliveryDocumentItem")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_outbound_delivery_headers(conn):
    records = read_jsonl_files(DATA_ROOT / "outbound_delivery_headers")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO outbound_delivery_headers
                (deliveryDocument, creationDate, actualGoodsMovementDate,
                 deliveryBlockReason, hdrGeneralIncompletionStatus, headerBillingBlockReason,
                 overallGoodsMovementStatus, overallPickingStatus, shippingPoint)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (
                r.get("deliveryDocument"), r.get("creationDate"),
                r.get("actualGoodsMovementDate"), r.get("deliveryBlockReason"),
                r.get("hdrGeneralIncompletionStatus"), r.get("headerBillingBlockReason"),
                r.get("overallGoodsMovementStatus"), r.get("overallPickingStatus"),
                r.get("shippingPoint")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_outbound_delivery_items(conn):
    records = read_jsonl_files(DATA_ROOT / "outbound_delivery_items")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO outbound_delivery_items
                (deliveryDocument, deliveryDocumentItem, actualDeliveryQuantity,
                 deliveryQuantityUnit, plant, referenceSdDocument, referenceSdDocumentItem,
                 storageLocation, itemBillingBlockReason)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (
                r.get("deliveryDocument"), r.get("deliveryDocumentItem"),
                to_real(r.get("actualDeliveryQuantity")),
                r.get("deliveryQuantityUnit"), r.get("plant"),
                r.get("referenceSdDocument"), r.get("referenceSdDocumentItem"),
                r.get("storageLocation"), r.get("itemBillingBlockReason")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_billing_document_headers(conn):
    records = read_jsonl_files(DATA_ROOT / "billing_document_headers")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO billing_document_headers
                (billingDocument, billingDocumentType, creationDate, billingDocumentDate,
                 billingDocumentIsCancelled, cancelledBillingDocument, totalNetAmount,
                 transactionCurrency, companyCode, fiscalYear, accountingDocument, soldToParty)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("billingDocument"), r.get("billingDocumentType"),
                r.get("creationDate"), r.get("billingDocumentDate"),
                to_int(r.get("billingDocumentIsCancelled")),
                r.get("cancelledBillingDocument"),
                to_real(r.get("totalNetAmount")),
                r.get("transactionCurrency"), r.get("companyCode"),
                r.get("fiscalYear"), r.get("accountingDocument"), r.get("soldToParty")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_billing_document_items(conn):
    records = read_jsonl_files(DATA_ROOT / "billing_document_items")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            # JSONL uses referenceSdDocument / referenceSdDocumentItem
            sales_doc = r.get("salesDocument") or r.get("referenceSdDocument")
            sales_doc_item = r.get("salesDocumentItem") or r.get("referenceSdDocumentItem")
            cur.execute("""
                INSERT OR REPLACE INTO billing_document_items
                (billingDocument, billingDocumentItem, salesDocument, salesDocumentItem,
                 material, billingQuantity, billingQuantityUnit, netAmount,
                 transactionCurrency, plant)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("billingDocument"), r.get("billingDocumentItem"),
                sales_doc, sales_doc_item,
                r.get("material"),
                to_real(r.get("billingQuantity")),
                r.get("billingQuantityUnit"),
                to_real(r.get("netAmount")),
                r.get("transactionCurrency"), r.get("plant")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_billing_document_cancellations(conn):
    # The cancellations file is nested inside customer_company_assignments folder!
    cancel_path = DATA_ROOT / "customer_company_assignments" / "billing_document_cancellations"
    records = read_jsonl_files(cancel_path)
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO billing_document_cancellations
                (billingDocument, billingDocumentType, creationDate,
                 billingDocumentIsCancelled, cancelledBillingDocument, totalNetAmount,
                 transactionCurrency, companyCode, fiscalYear, accountingDocument, soldToParty)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("billingDocument"), r.get("billingDocumentType"),
                r.get("creationDate"),
                to_int(r.get("billingDocumentIsCancelled")),
                r.get("cancelledBillingDocument"),
                to_real(r.get("totalNetAmount")),
                r.get("transactionCurrency"), r.get("companyCode"),
                r.get("fiscalYear"), r.get("accountingDocument"), r.get("soldToParty")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_journal_entry_items(conn):
    records = read_jsonl_files(DATA_ROOT / "journal_entry_items_accounts_receivable")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO journal_entry_items
                (companyCode, fiscalYear, accountingDocument, accountingDocumentItem,
                 glAccount, referenceDocument, costCenter, profitCenter,
                 transactionCurrency, amountInTransactionCurrency, companyCodeCurrency,
                 amountInCompanyCodeCurrency, postingDate, documentDate,
                 accountingDocumentType, customer, financialAccountType,
                 clearingDate, clearingAccountingDocument)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("companyCode"), r.get("fiscalYear"),
                r.get("accountingDocument"), r.get("accountingDocumentItem"),
                r.get("glAccount"), r.get("referenceDocument"),
                r.get("costCenter"), r.get("profitCenter"),
                r.get("transactionCurrency"),
                to_real(r.get("amountInTransactionCurrency")),
                r.get("companyCodeCurrency"),
                to_real(r.get("amountInCompanyCodeCurrency")),
                r.get("postingDate"), r.get("documentDate"),
                r.get("accountingDocumentType"), r.get("customer"),
                r.get("financialAccountType"),
                r.get("clearingDate"), r.get("clearingAccountingDocument")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_payments(conn):
    records = read_jsonl_files(DATA_ROOT / "payments_accounts_receivable")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO payments_accounts_receivable
                (companyCode, fiscalYear, accountingDocument, accountingDocumentItem,
                 clearingDate, clearingAccountingDocument, clearingDocFiscalYear,
                 amountInTransactionCurrency, transactionCurrency, customer,
                 invoiceReference, invoiceReferenceFiscalYear, salesDocument, salesDocumentItem,
                 postingDate, documentDate, glAccount, financialAccountType,
                 profitCenter, costCenter)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("companyCode"), r.get("fiscalYear"),
                r.get("accountingDocument"), r.get("accountingDocumentItem"),
                r.get("clearingDate"), r.get("clearingAccountingDocument"),
                r.get("clearingDocFiscalYear"),
                to_real(r.get("amountInTransactionCurrency")),
                r.get("transactionCurrency"), r.get("customer"),
                r.get("invoiceReference"), r.get("invoiceReferenceFiscalYear"),
                r.get("salesDocument"), r.get("salesDocumentItem"),
                r.get("postingDate"), r.get("documentDate"),
                r.get("glAccount"), r.get("financialAccountType"),
                r.get("profitCenter"), r.get("costCenter")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_business_partners(conn):
    records = read_jsonl_files(DATA_ROOT / "business_partners")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO business_partners
                (businessPartner, customer, businessPartnerCategory, businessPartnerFullName,
                 businessPartnerName, businessPartnerGrouping, industry, creationDate,
                 organizationBpName1, businessPartnerIsBlocked, isMarkedForArchiving)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """, (
                r.get("businessPartner"), r.get("customer"),
                r.get("businessPartnerCategory"), r.get("businessPartnerFullName"),
                r.get("businessPartnerName"), r.get("businessPartnerGrouping"),
                r.get("industry"), r.get("creationDate"),
                r.get("organizationBpName1"),
                to_int(r.get("businessPartnerIsBlocked")),
                to_int(r.get("isMarkedForArchiving"))
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_business_partner_addresses(conn):
    records = read_jsonl_files(DATA_ROOT / "business_partner_addresses")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO business_partner_addresses
                (businessPartner, addressId, cityName, country, postalCode,
                 region, streetName, transportZone)
                VALUES (?,?,?,?,?,?,?,?)
            """, (
                r.get("businessPartner"), r.get("addressId"),
                r.get("cityName"), r.get("country"),
                r.get("postalCode"), r.get("region"),
                r.get("streetName"), r.get("transportZone")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_customer_company_assignments(conn):
    records = read_jsonl_files(DATA_ROOT / "customer_company_assignments")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO customer_company_assignments
                (customer, companyCode, paymentTerms, reconciliationAccount,
                 deletionIndicator, customerAccountGroup)
                VALUES (?,?,?,?,?,?)
            """, (
                r.get("customer"), r.get("companyCode"),
                r.get("paymentTerms"), r.get("reconciliationAccount"),
                to_int(r.get("deletionIndicator")),
                r.get("customerAccountGroup")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_customer_sales_area_assignments(conn):
    records = read_jsonl_files(DATA_ROOT / "customer_sales_area_assignments")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO customer_sales_area_assignments
                (customer, salesOrganization, distributionChannel, division,
                 currency, customerPaymentTerms, deliveryPriority, supplyingPlant, salesDistrict)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (
                r.get("customer"), r.get("salesOrganization"),
                r.get("distributionChannel"), r.get("division"),
                r.get("currency"), r.get("customerPaymentTerms"),
                r.get("deliveryPriority"), r.get("supplyingPlant"),
                r.get("salesDistrict")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_products(conn):
    records = read_jsonl_files(DATA_ROOT / "products")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO products
                (product, productType, creationDate, baseUnit, weightUnit,
                 netWeight, grossWeight, productGroup, division)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (
                r.get("product"), r.get("productType"),
                r.get("creationDate"), r.get("baseUnit"),
                r.get("weightUnit"),
                to_real(r.get("netWeight")),
                to_real(r.get("grossWeight")),
                r.get("productGroup"), r.get("division")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_product_descriptions(conn):
    records = read_jsonl_files(DATA_ROOT / "product_descriptions")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO product_descriptions
                (product, language, productDescription)
                VALUES (?,?,?)
            """, (
                r.get("product"), r.get("language"), r.get("productDescription")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_product_plants(conn):
    records = read_jsonl_files(DATA_ROOT / "product_plants")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO product_plants
                (product, plant, profitCenter, goodsReceiptProcessingTime)
                VALUES (?,?,?,?)
            """, (
                r.get("product"), r.get("plant"),
                r.get("profitCenter"),
                to_real(r.get("goodsReceiptProcessingTime"))
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_product_storage_locations(conn):
    records = read_jsonl_files(DATA_ROOT / "product_storage_locations")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO product_storage_locations
                (product, plant, storageLocation)
                VALUES (?,?,?)
            """, (
                r.get("product"), r.get("plant"), r.get("storageLocation")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def ingest_plants(conn):
    records = read_jsonl_files(DATA_ROOT / "plants")
    cur = conn.cursor()
    count = 0
    for r in records:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO plants
                (plant, plantName, valuationArea, salesOrganization,
                 distributionChannel, language)
                VALUES (?,?,?,?,?,?)
            """, (
                r.get("plant"), r.get("plantName"),
                r.get("valuationArea"), r.get("salesOrganization"),
                r.get("distributionChannel"), r.get("language")
            ))
            count += 1
        except Exception:
            pass
    conn.commit()
    return count


def main():
    print(f"Dataset root: {DATA_ROOT.resolve()}")
    if not DATA_ROOT.exists():
        print(f"ERROR: Dataset not found at {DATA_ROOT.resolve()}")
        print("Please ensure sap-o2c-data/ is at the project root (alongside otc-graph/)")
        return

    print(f"Database path: {DATABASE_PATH}")
    conn = get_db()
    create_schema(conn)

    ingestion_funcs = [
        ("sales_order_headers", ingest_sales_order_headers),
        ("sales_order_items", ingest_sales_order_items),
        ("sales_order_schedule_lines", ingest_sales_order_schedule_lines),
        ("outbound_delivery_headers", ingest_outbound_delivery_headers),
        ("outbound_delivery_items", ingest_outbound_delivery_items),
        ("billing_document_headers", ingest_billing_document_headers),
        ("billing_document_items", ingest_billing_document_items),
        ("billing_document_cancellations", ingest_billing_document_cancellations),
        ("journal_entry_items", ingest_journal_entry_items),
        ("payments_accounts_receivable", ingest_payments),
        ("business_partners", ingest_business_partners),
        ("business_partner_addresses", ingest_business_partner_addresses),
        ("customer_company_assignments", ingest_customer_company_assignments),
        ("customer_sales_area_assignments", ingest_customer_sales_area_assignments),
        ("products", ingest_products),
        ("product_descriptions", ingest_product_descriptions),
        ("product_plants", ingest_product_plants),
        ("product_storage_locations", ingest_product_storage_locations),
        ("plants", ingest_plants),
    ]

    print("\n--- Ingesting Data ---")
    total = 0
    for table_name, func in ingestion_funcs:
        count = func(conn)
        print(f"  {table_name}: {count} records")
        total += count

    print(f"\nDONE. Total records ingested: {total}")
    conn.close()


if __name__ == "__main__":
    main()
