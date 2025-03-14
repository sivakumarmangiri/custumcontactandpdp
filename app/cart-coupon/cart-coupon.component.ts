import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cart, CustomerCoupon, CartVoucherService, CustomerCouponService, ActiveCartService, CustomerCouponSearchResult } from '@spartacus/core';

import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'cx-cart-coupon',
  templateUrl: './cart-coupon.component.html',
  styleUrls: ['./cart-coupan.component.scss']
})
export class STCartCouponComponent implements OnInit, OnDestroy {
  MAX_CUSTOMER_COUPON_PAGE = 100;
  couponForm!: FormGroup;
  cartIsLoading$!: Observable<boolean>;
  cart$!: Observable<Cart>;
  cartId!: any;
  applicableCoupons!: CustomerCoupon[] ;

  protected ignoreCloseEvent = false;

  protected subscription = new Subscription();

  couponBoxIsActive = false;

  constructor(
    protected cartVoucherService: CartVoucherService,
    protected formBuilder: FormBuilder,
    protected customerCouponService: CustomerCouponService,
    protected activeCartService: ActiveCartService
  ) {}

  ngOnInit() {
    if (this.customerCouponService) {
      this.customerCouponService.loadCustomerCoupons(
        this.MAX_CUSTOMER_COUPON_PAGE
      );
    }

    this.cart$ = combineLatest([
      this.activeCartService.getActive(),
      this.activeCartService.getActiveCartId(),
      this.customerCouponService.getCustomerCoupons(
        this.MAX_CUSTOMER_COUPON_PAGE
      ),
    ]).pipe(
      tap(
        ([activeCardId]: [
          Cart,
          string,
          CustomerCouponSearchResult
        ]) => {
          this.cartId = activeCardId;
          // this.getApplicableCustomerCoupons(cart, customerCoupons.coupons);
        }
      ),
      map(([cart]: [Cart, string, CustomerCouponSearchResult]) => cart)
    );

    this.cartIsLoading$ = this.activeCartService
      .isStable()
      .pipe(map((loaded) => !loaded));

    this.cartVoucherService.resetAddVoucherProcessingState();

    this.couponForm = this.formBuilder.group({
      couponCode: ['', [Validators.required]],
    });

    this.subscription.add(
      this.cartVoucherService
        .getAddVoucherResultSuccess()
        .subscribe((success) => {
          this.onSuccess(success);
        })
    );

    this.subscription.add(
      this.cartVoucherService.getAddVoucherResultError().subscribe((error) => {
        this.onError(error);
      })
    );
  }

  protected onError(error: boolean) {
    if (error) {
      this.customerCouponService.loadCustomerCoupons(
        this.MAX_CUSTOMER_COUPON_PAGE
      );
      this.cartVoucherService.resetAddVoucherProcessingState();
    }
  }

  onSuccess(success: boolean) {
    if (success) {
      this.couponForm.reset();
      this.cartVoucherService.resetAddVoucherProcessingState();
    }
  }

  protected getApplicableCustomerCoupons(
    cart: Cart,
    coupons: CustomerCoupon[]
  ): void {
    this.applicableCoupons = coupons || [];
    if (cart.appliedVouchers) {
      cart.appliedVouchers.forEach((appliedVoucher) => {
        this.applicableCoupons = this.applicableCoupons.filter(
          (coupon) => coupon.couponId !== appliedVoucher.code
        );
      });
    }
  }

  applyVoucher(): void {
    if (this.couponForm.valid) {
      this.cartVoucherService.addVoucher(
        this.couponForm.value.couponCode,
        this.cartId
      );
    } else {
      this.couponForm.markAllAsTouched();
    }
  }
  status: boolean = false;
clickEvent(){
    this.status = !this.status;
}
  applyCustomerCoupon(couponId: any): void {
    this.cartVoucherService.addVoucher(couponId, this.cartId);
    this.couponBoxIsActive = false;
  }

  close(event: UIEvent): void {
    if (!this.ignoreCloseEvent) {
      this.couponBoxIsActive = false;
      if (event && event.target) {
        (<HTMLElement>event.target).blur();
      }
    }
    this.ignoreCloseEvent = false;
  }

  disableClose(): void {
    this.ignoreCloseEvent = true;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.cartVoucherService.resetAddVoucherProcessingState();
  }
}
