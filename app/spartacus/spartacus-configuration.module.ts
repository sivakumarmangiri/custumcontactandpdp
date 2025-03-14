import { NgModule } from '@angular/core';
import { translationChunksConfig, translations } from "@spartacus/assets";
import { FeaturesConfig, I18nConfig, OccConfig, provideConfig, SiteContextConfig } from "@spartacus/core";
import { defaultCmsContentProviders, layoutConfig, mediaConfig } from "@spartacus/storefront";
// import { CustomCartModule } from './custom-cart/custom-cart.module';
// import { CustomContactModule } from './custom-contact/custom-contact.module';
// import { CustompdpModule } from './custompdp/custompdp.module';

@NgModule({
  declarations: [],
  imports: [
  //  CustomContactModule,
  //  CustompdpModule,
   // CustomCartModule
  ],
  providers: [provideConfig(layoutConfig), provideConfig(mediaConfig), ...defaultCmsContentProviders, provideConfig(<OccConfig>{
    backend: {
      occ: {
        baseUrl: 'https://spartacus-demo.eastus.cloudapp.azure.com:8443',
        prefix: '/occ/v2/',
      }
    },
  }), provideConfig(<SiteContextConfig>{
    context: {
      language: ['en'],
      urlParameters: ['baseSite', 'language', 'currency'],
      baseSite: ['electronics-spa','apparel-uk-spa'],
      currency: ['USD', 'GBP',]
    },
  }), provideConfig(<I18nConfig>{
    i18n: {
      resources: translations,
      chunks: translationChunksConfig,
      fallbackLang: 'en'
    },
  }), provideConfig(<FeaturesConfig>{
    features: {
      level: '4.3'
    }
  }),
 // CustomContactModule
]
})
export class SpartacusConfigurationModule { }
