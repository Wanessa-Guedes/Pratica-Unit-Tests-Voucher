import { jest } from "@jest/globals";
import { Voucher } from "@prisma/client";
import voucherRepository from "../../src/repositories/voucherRepository.js";
import voucherService from "../../src/services/voucherService.js";

describe("voucherService test suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("should be always very positive", () => {
    expect("didi").toBe("didi");
  })
  it("should create a voucher FAIL - VOUCHER Already registered", async () => {
    const voucher: Voucher = {
      id: 1,
      code: '123',
      discount: 10,
      used: false,
    };
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
    jest.spyOn(voucherRepository, "createVoucher").mockResolvedValueOnce(voucher);
    await expect(voucherService.createVoucher(voucher.code, voucher.discount)).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  })
  it("should create a voucher", async () => {
    const voucher: Voucher = {
      id: 2,
      code: '1234',
      discount: 20,
      used: false,
    };
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);
    await voucherService.createVoucher(voucher.code, voucher.discount);
    expect(voucherRepository.createVoucher).toBeCalledTimes(1);
  })
  it("should apply voucher of 10%", async () => {
    const voucher: Voucher = {
      id: 1,
      code: '123',
      discount: 10,
      used: false,
    };

    const voucherUsed: Voucher = {
      id: 1,
      code: '123',
      discount: 10,
      used: true,
    };
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
    jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(voucherUsed);
    const result = await voucherService.applyVoucher(voucher.code, 200);
    expect(voucherRepository.useVoucher).toBeCalled;
    expect(result).toMatchObject({amount: 200, 
      discount: voucher.discount, 
      finalAmount: (200 - (200 * (voucher.discount / 100))), 
      applied: true})
  })
  it("should apply voucher - FAIL - Voucher does not exist", async () => {
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);
    jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(null);
    expect(voucherService.applyVoucher).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  })
  it("should apply voucher - FAIL - Min value not reached", async () => {
    const voucher: Voucher = {
      id: 1,
      code: '123',
      discount: 10,
      used: false,
    };

    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
    const result = await voucherService.applyVoucher(voucher.code, 50);
    expect(result).toMatchObject({amount: 50, 
      discount: voucher.discount, 
      finalAmount: 50, 
      applied: false})
  })
  it("should apply voucher - FAIL - Voucher already used", async () => {
    const voucher: Voucher = {
      id: 1,
      code: '123',
      discount: 10,
      used: true,
    };

    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
    const result = await voucherService.applyVoucher(voucher.code, 50);
    expect(result).toMatchObject({amount: 50, 
      discount: voucher.discount, 
      finalAmount: 50, 
      applied: false})
  })
})