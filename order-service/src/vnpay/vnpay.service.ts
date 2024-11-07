import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class VnpayService {
  constructor(
    private configService: ConfigService,
    private orderService: OrderService,
  ) {}

  createPaymentUrl(
    amount: number,
    orderId: number,
    orderDescription: string,
  ): { paymentUrl: string } {
    const ipAddr = '127.0.0.1';
    const orderType = 'other';
    const language = 'vn';

    const _orderDescription = orderDescription.replaceAll(' ', '_');
    const tmnCode = this.configService.get<string>('TMN_CODE');
    const secretKey = this.configService.get<string>('HASH_SECRET');
    const vnpUrl = this.configService.get<string>('VNP_URL');
    const returnUrl = this.configService.get<string>('RETURN_URL');

    const date = new Date();
    const createDate = this.dateFormat(date, 'yyyymmddHHMMss');
    const locale = language || 'vn';
    const currCode = 'VND';

    const vnp_Params: { [key: string]: string | number } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: _orderDescription,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp tham số theo thứ tự tăng dần
    const sortedParams = this.sortObject(vnp_Params);

    // Tạo dữ liệu checksum (vnp_SecureHash)
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    // Tạo URL kết quả
    return {
      paymentUrl: `${vnpUrl}?${querystring.stringify(sortedParams, { encode: false })}`,
    };
  }

  // verifyPayment(vnp_Params: any): { RspCode: string; Message: string } {
  //   console.log('hello');

  //   const secureHash = vnp_Params['vnp_SecureHash'];

  //   delete vnp_Params['vnp_SecureHash'];
  //   delete vnp_Params['vnp_SecureHashType'];

  //   const sortedParams = this.sortObject(vnp_Params);
  //   const secretKey = this.configService.get<string>('vnp_HashSecret');
  //   const signData = querystring.stringify(sortedParams, { encode: false });
  //   const hmac = crypto.createHmac('sha512', secretKey);
  //   const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  //   if (secureHash === signed) {
  //     const orderId = vnp_Params['vnp_TxnRef'];
  //     const rspCode = vnp_Params['vnp_ResponseCode'];
  //     // Kiểm tra dữ liệu có hợp lệ không, cập nhật trạng thái đơn hàng và gửi kết quả cho VNPAY
  //     return { RspCode: '00', Message: 'success' };
  //   } else {
  //     return { RspCode: '97', Message: 'Fail checksum' };
  //   }
  // }

  async verifyReturnUrl(vnp_Params: any): Promise<string> {
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const secretKey = this.configService.get<string>('HASH_SECRET');
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderIdStr = (vnp_Params['vnp_OrderInfo'] as string).replace(
        'Thanh_toan_don_hang_Guds._Ma_don_hang_',
        '',
      );
      const orderId = Number.parseInt(orderIdStr);
      const transactionId = vnp_Params['vnp_TransactionNo'];
      await this.orderService.updateVNpayPayment(orderId, transactionId);

      return vnp_Params['vnp_ResponseCode'];
    } else {
      return '97';
    }
  }

  private sortObject(obj: { [key: string]: string | number }): {
    [key: string]: string | number;
  } {
    const sorted: { [key: string]: string | number } = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        if (obj[key] !== undefined && obj[key] !== null) {
          sorted[key] = obj[key];
        }
      });
    return sorted;
  }

  private dateFormat(date: Date, format: string): string {
    const pad = (num: number, size: number) =>
      num.toString().padStart(size, '0');

    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // Tháng bắt đầu từ 0
    const dd = date.getDate();
    const HH = date.getHours();
    const MMi = date.getMinutes();
    const ss = date.getSeconds();

    return format
      .replace('yyyy', yyyy.toString())
      .replace('mm', pad(mm, 2))
      .replace('dd', pad(dd, 2))
      .replace('HH', pad(HH, 2))
      .replace('MM', pad(MMi, 2))
      .replace('ss', pad(ss, 2));
  }
}
