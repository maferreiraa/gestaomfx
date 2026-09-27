import axios from 'axios'
import { env } from '../../config/env'

interface CreatePixPaymentRequest {
  amount: number
  description: string
  email: string
  externalReference: string
}

interface CreatePixPaymentResponse {
  qrCode: string
  qrCodeUrl: string
  copyPasteKey: string
  paymentId: string
}

export class MercadoPagoService {
  private baseUrl = 'https://api.mercadopago.com'
  private accessToken = env.MERCADO_PAGO_ACCESS_TOKEN

  async createPixPayment(
    request: CreatePixPaymentRequest
  ): Promise<CreatePixPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/payments`,
        {
          transaction_amount: request.amount,
          description: request.description,
          payment_method_id: 'pix',
          payer: {
            email: request.email,
          },
          external_reference: request.externalReference,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const paymentData = response.data

      if (paymentData.status === 'pending') {
        const pointOfInteraction = paymentData.point_of_interaction?.transaction_data

        return {
          qrCode: pointOfInteraction?.qr_code || '',
          qrCodeUrl: pointOfInteraction?.qr_code_base64 || '',
          copyPasteKey: pointOfInteraction?.copy_paste_key || '',
          paymentId: paymentData.id.toString(),
        }
      }

      throw new Error('Failed to create PIX payment: ' + paymentData.status)
    } catch (error: any) {
      console.error('Mercado Pago API error:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.message || 'Failed to create PIX payment'
      )
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      return response.data.status
    } catch (error: any) {
      console.error('Error fetching payment status:', error.message)
      throw new Error('Failed to fetch payment status')
    }
  }
}

export const mercadoPagoService = new MercadoPagoService()
