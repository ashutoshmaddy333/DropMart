import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { PaymentsService } from "./payments.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Public, RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { CheckoutDto, VerifyPaymentDto } from "./dto/payments.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post("checkout")
  @UseGuards(AuthGuard)
  @RequirePermissions("order:read:own")
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: RequestUser) {
    return this.paymentsService.checkout(dto, user.id);
  }

  @Post("verify")
  @UseGuards(AuthGuard)
  @RequirePermissions("order:read:own")
  verify(@Body() dto: VerifyPaymentDto, @CurrentUser() user: RequestUser) {
    return this.paymentsService.verifyClientPayment(dto, user.id);
  }

  @Public()
  @Post("webhook/razorpay")
  async razorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("x-razorpay-signature") signature?: string,
    @Headers("x-razorpay-event-id") eventId?: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) throw new UnauthorizedException("Raw body required for webhook verification");
    return this.paymentsService.handleWebhook(rawBody, signature, eventId);
  }
}
