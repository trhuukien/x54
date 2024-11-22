import prisma from './context/prisma.js';

export const getCustomerInvoice = async (ssid, order_id) => {
  return prisma.customerInvoices.findUnique({
    where: {
			session_id_order_id: {
				session_id: ssid,
				order_id: order_id + ''
			}
		}
  });
};

export const updateCustomerInvoices = async (ssid, status, orderData, invoiceData = '') => {
  await prisma.customerInvoices.upsert({
		where: {
			session_id_order_id: {
				session_id: ssid,
				order_id: orderData.id + ''
			}
		},
		update: {
			status: status,
			order_data: JSON.stringify(orderData),
			invoice_data: JSON.stringify(invoiceData),
			updatedAt: new Date()
		},
		create: {
			session_id: ssid,
			status: status,
			order_id: orderData.id + '',
			invoice_id: invoiceData.id + '',
			order_data: JSON.stringify(orderData),
			invoice_data: ''
		}
	});

	console.log('DATABASE CustomerInvoices is saved order_id:', orderData.id);
};