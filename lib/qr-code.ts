import QRCode from "qrcode"

export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
    return qrDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}
