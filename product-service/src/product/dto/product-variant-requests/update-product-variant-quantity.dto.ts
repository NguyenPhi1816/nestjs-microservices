export default class Update_PV_Quantity_Req {
  productVariantId: number;
  quantity: number;
  type: 'increment' | 'decrement';
}
