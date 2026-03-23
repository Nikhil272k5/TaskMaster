import sqlite3
import os
from pathlib import Path

_BACKEND_DIR = Path(__file__).parent
DATABASE_PATH = os.getenv("DATABASE_PATH", str(_BACKEND_DIR / "otc.db"))


def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def create_schema(conn):
    cursor = conn.cursor()
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS sales_order_headers (
        salesOrder TEXT PRIMARY KEY,
        salesOrderType TEXT,
        salesOrganization TEXT,
        distributionChannel TEXT,
        organizationDivision TEXT,
        soldToParty TEXT,
        creationDate TEXT,
        createdByUser TEXT,
        totalNetAmount REAL,
        overallDeliveryStatus TEXT,
        overallOrdReltdBillgStatus TEXT,
        transactionCurrency TEXT,
        requestedDeliveryDate TEXT,
        headerBillingBlockReason TEXT,
        deliveryBlockReason TEXT,
        customerPaymentTerms TEXT,
        totalCreditCheckStatus TEXT
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
        salesOrder TEXT,
        salesOrderItem TEXT,
        salesOrderItemCategory TEXT,
        material TEXT,
        requestedQuantity REAL,
        requestedQuantityUnit TEXT,
        netAmount REAL,
        transactionCurrency TEXT,
        materialGroup TEXT,
        productionPlant TEXT,
        storageLocation TEXT,
        itemBillingBlockReason TEXT,
        PRIMARY KEY (salesOrder, salesOrderItem)
    );

    CREATE TABLE IF NOT EXISTS sales_order_schedule_lines (
        salesOrder TEXT,
        salesOrderItem TEXT,
        scheduleLineNumber TEXT,
        requestedDeliveryDate TEXT,
        scheduledQuantity REAL,
        deliveredQuantityInBaseUnit REAL,
        confdDelivQtyInOrderQtyUnit REAL,
        deliveryDocument TEXT,
        deliveryDocumentItem TEXT,
        PRIMARY KEY (salesOrder, salesOrderItem, scheduleLineNumber)
    );

    CREATE TABLE IF NOT EXISTS outbound_delivery_headers (
        deliveryDocument TEXT PRIMARY KEY,
        creationDate TEXT,
        actualGoodsMovementDate TEXT,
        deliveryBlockReason TEXT,
        hdrGeneralIncompletionStatus TEXT,
        headerBillingBlockReason TEXT,
        overallGoodsMovementStatus TEXT,
        overallPickingStatus TEXT,
        shippingPoint TEXT
    );

    CREATE TABLE IF NOT EXISTS outbound_delivery_items (
        deliveryDocument TEXT,
        deliveryDocumentItem TEXT,
        actualDeliveryQuantity REAL,
        deliveryQuantityUnit TEXT,
        plant TEXT,
        referenceSdDocument TEXT,
        referenceSdDocumentItem TEXT,
        storageLocation TEXT,
        itemBillingBlockReason TEXT,
        PRIMARY KEY (deliveryDocument, deliveryDocumentItem)
    );

    CREATE TABLE IF NOT EXISTS billing_document_headers (
        billingDocument TEXT PRIMARY KEY,
        billingDocumentType TEXT,
        creationDate TEXT,
        billingDocumentDate TEXT,
        billingDocumentIsCancelled INTEGER,
        cancelledBillingDocument TEXT,
        totalNetAmount REAL,
        transactionCurrency TEXT,
        companyCode TEXT,
        fiscalYear TEXT,
        accountingDocument TEXT,
        soldToParty TEXT
    );

    CREATE TABLE IF NOT EXISTS billing_document_items (
        billingDocument TEXT,
        billingDocumentItem TEXT,
        salesDocument TEXT,
        salesDocumentItem TEXT,
        material TEXT,
        billingQuantity REAL,
        billingQuantityUnit TEXT,
        netAmount REAL,
        transactionCurrency TEXT,
        plant TEXT,
        PRIMARY KEY (billingDocument, billingDocumentItem)
    );

    CREATE TABLE IF NOT EXISTS billing_document_cancellations (
        billingDocument TEXT PRIMARY KEY,
        billingDocumentType TEXT,
        creationDate TEXT,
        billingDocumentIsCancelled INTEGER,
        cancelledBillingDocument TEXT,
        totalNetAmount REAL,
        transactionCurrency TEXT,
        companyCode TEXT,
        fiscalYear TEXT,
        accountingDocument TEXT,
        soldToParty TEXT
    );

    CREATE TABLE IF NOT EXISTS journal_entry_items (
        companyCode TEXT,
        fiscalYear TEXT,
        accountingDocument TEXT,
        accountingDocumentItem TEXT,
        glAccount TEXT,
        referenceDocument TEXT,
        costCenter TEXT,
        profitCenter TEXT,
        transactionCurrency TEXT,
        amountInTransactionCurrency REAL,
        companyCodeCurrency TEXT,
        amountInCompanyCodeCurrency REAL,
        postingDate TEXT,
        documentDate TEXT,
        accountingDocumentType TEXT,
        customer TEXT,
        financialAccountType TEXT,
        clearingDate TEXT,
        clearingAccountingDocument TEXT,
        PRIMARY KEY (companyCode, fiscalYear, accountingDocument, accountingDocumentItem)
    );

    CREATE TABLE IF NOT EXISTS payments_accounts_receivable (
        companyCode TEXT,
        fiscalYear TEXT,
        accountingDocument TEXT,
        accountingDocumentItem TEXT,
        clearingDate TEXT,
        clearingAccountingDocument TEXT,
        clearingDocFiscalYear TEXT,
        amountInTransactionCurrency REAL,
        transactionCurrency TEXT,
        customer TEXT,
        invoiceReference TEXT,
        invoiceReferenceFiscalYear TEXT,
        salesDocument TEXT,
        salesDocumentItem TEXT,
        postingDate TEXT,
        documentDate TEXT,
        glAccount TEXT,
        financialAccountType TEXT,
        profitCenter TEXT,
        costCenter TEXT,
        PRIMARY KEY (companyCode, fiscalYear, accountingDocument, accountingDocumentItem)
    );

    CREATE TABLE IF NOT EXISTS business_partners (
        businessPartner TEXT PRIMARY KEY,
        customer TEXT,
        businessPartnerCategory TEXT,
        businessPartnerFullName TEXT,
        businessPartnerName TEXT,
        businessPartnerGrouping TEXT,
        industry TEXT,
        creationDate TEXT,
        organizationBpName1 TEXT,
        businessPartnerIsBlocked INTEGER,
        isMarkedForArchiving INTEGER
    );

    CREATE TABLE IF NOT EXISTS business_partner_addresses (
        businessPartner TEXT,
        addressId TEXT,
        cityName TEXT,
        country TEXT,
        postalCode TEXT,
        region TEXT,
        streetName TEXT,
        transportZone TEXT,
        PRIMARY KEY (businessPartner, addressId)
    );

    CREATE TABLE IF NOT EXISTS customer_company_assignments (
        customer TEXT,
        companyCode TEXT,
        paymentTerms TEXT,
        reconciliationAccount TEXT,
        deletionIndicator INTEGER,
        customerAccountGroup TEXT,
        PRIMARY KEY (customer, companyCode)
    );

    CREATE TABLE IF NOT EXISTS customer_sales_area_assignments (
        customer TEXT,
        salesOrganization TEXT,
        distributionChannel TEXT,
        division TEXT,
        currency TEXT,
        customerPaymentTerms TEXT,
        deliveryPriority TEXT,
        supplyingPlant TEXT,
        salesDistrict TEXT,
        PRIMARY KEY (customer, salesOrganization, distributionChannel, division)
    );

    CREATE TABLE IF NOT EXISTS products (
        product TEXT PRIMARY KEY,
        productType TEXT,
        creationDate TEXT,
        baseUnit TEXT,
        weightUnit TEXT,
        netWeight REAL,
        grossWeight REAL,
        productGroup TEXT,
        division TEXT
    );

    CREATE TABLE IF NOT EXISTS product_descriptions (
        product TEXT,
        language TEXT,
        productDescription TEXT,
        PRIMARY KEY (product, language)
    );

    CREATE TABLE IF NOT EXISTS product_plants (
        product TEXT,
        plant TEXT,
        profitCenter TEXT,
        goodsReceiptProcessingTime REAL,
        PRIMARY KEY (product, plant)
    );

    CREATE TABLE IF NOT EXISTS product_storage_locations (
        product TEXT,
        plant TEXT,
        storageLocation TEXT,
        PRIMARY KEY (product, plant, storageLocation)
    );

    CREATE TABLE IF NOT EXISTS plants (
        plant TEXT PRIMARY KEY,
        plantName TEXT,
        valuationArea TEXT,
        salesOrganization TEXT,
        distributionChannel TEXT,
        language TEXT
    );
    """)
    conn.commit()
    print("Schema created successfully.")
