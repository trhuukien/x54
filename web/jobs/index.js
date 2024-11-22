import { getHogiaConfig, getApiToken, createVoucherDraft, createCustomerInvoices } from '../utils/hogia.js';

class Jobs {
	constructor(ssid) {
    this.ssid = ssid;
		this.hogia_sales_account = 3001 // DEMO DATA | Number of a sales account in Hogia
		this.hogia_tax_account = 2621 // DEMO DATA | Tax account in Hogia
		this.hogia_bank_account = 1940 // DEMO DATA | Bank account number
  }

	async getHogiaData() {
		const hogiaConfig = await getHogiaConfig(this.ssid);
		const token = await getApiToken(this.ssid, hogiaConfig);

		if (!hogiaConfig?.guid) {
			throw new Error(`Please save config auth Hogia`);
		}

		if (!token) {
			throw new Error(`Config auth Hogia invalid`);
		}

		return { hogiaConfig, token };
	}

	async handleOrderPaid(orderData) {
		const { line_items, created_at, currency  } = orderData;
		const { hogiaConfig, token } = await this.getHogiaData();

		try {
			let totalAmount = 0;

			const invoiceItems = line_items.flatMap(item => {
        const { quantity, price, tax_lines } = item; 
				const totalPrice = parseFloat(price) * quantity;
				const totalTax = tax_lines.reduce((total, taxLine) => {
					return total + parseFloat(taxLine.price);
				}, 0);
				totalAmount += (totalPrice + totalTax);

        return [
					{
						amount: (-1) * totalPrice,
						numberOf: quantity,
						text: '',
						accountNumber: this.hogia_sales_account
					}, {
						amount: (-1) * totalTax,
						text: '',
						accountNumber: this.hogia_tax_account
					}
				]
      });

			const requestBody = {
				voucherDraft: {
					voucherDate: created_at,
					voucherType: 'Unspecified',
					currencyCode: currency
				},
				voucherDraftRows: [
					...invoiceItems,
					{
						amount: totalAmount,
						text: '',
						accountNumber: this.hogia_bank_account
					}
				]
			};

			await createVoucherDraft(
				{
					ssid: this.ssid,
					order_id: orderData.id,
					token: token,
					guid: hogiaConfig?.guid
				},
				requestBody
			);
		} catch(e) {
			console.log(e);
			throw new Error(`Error save voucher`);
		}
	}

	async handleOrderNotPaid(orderData) {
		const { order_number, customer, line_items, created_at, currency  } = orderData;
		const { hogiaConfig, token } = await this.getHogiaData();

		try {
			const invoiceItems = line_items.map(item => {
        const { name, quantity, price, tax_lines } = item;
				const VAT = tax_lines.find((item) => item?.title === 'VAT');

        return {
					"unitPrice": price,
					"unitType": "st",
					"quantity": quantity,
					"salesAccountNumber": this.hogia_sales_account,
					"vat": {
						"percent": VAT?.rate,
						"accountNumber": this.hogia_tax_account
					},
					"name": name,
					"type": "InvoiceLine"
				}
      });

			const requestBody = {
				"currencyInfo": {
					"exchangeRate": 0,
					"roundingFactor": 1,
					"currency": {
						"decimals": 2,
						"code": currency
					},
					"accountingCurrency": {
						"decimals": 2,
						"code": currency
					}
				},
				"invoiceLines": [
					{
						"type": "TextInvoiceLine",
						"name": "Kvittonummer 203"
					},
					...invoiceItems
				],
				"invoiceHeader": {
					"invoiceDate": created_at?.split("T")[0] ?? new Date().toISOString().split('T')[0],
					"invoiceNumber": order_number,
					"customer": {
						"number": "1234"
					},
					"comment": "",
					"ourReference": "",
					"yourReference": ""
				}
			};

			await createCustomerInvoices(
				{
					ssid: this.ssid,
					order_data: orderData,
					token: token,
					guid: hogiaConfig?.guid
				},
				requestBody
			);
		} catch(e) {
			console.log(e);
			throw new Error(`Error save customer invoice`);
		}
	}
}

export default Jobs;
