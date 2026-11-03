import { APP_INITIALIZER, NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import {
  AnnouncementsModule,
  CommonStripModule,
  CommonMethodsService,
  ContentStripWithTabsLibModule,
  DataPointsModule,
  HttpLoaderFactory,
  SlidersLibModule,
  WIDGET_REGISTRATION_LIB_CONFIG,
} from '@sunbird-cb/consumption'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { InitService } from './services/init.service';
import { environment } from '../environments/environment';
import { SbUiResolverModule, SbUiResolverService } from '@sunbird-cb/resolver-v2';
import { PipePublicURL } from './pipes/pipe-public-URL/pipe-public-URL.pipe';
import { ChatbotComponent } from './chatbot/chatbot.component';

export const ENVIRONMENT = new InjectionToken<any>('environment');

const appInitializer = (initSvc: InitService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    console.error('ERROR DURING APP INITIALIZATION >', error)
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    AppRoutingModule,
    AnnouncementsModule,
    CommonStripModule,
    ContentStripWithTabsLibModule,
    DataPointsModule,
    SlidersLibModule,
    TranslateModule,
    PipePublicURL,
    ChatbotComponent,
    SbUiResolverModule.forRoot([...WIDGET_REGISTRATION_LIB_CONFIG]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    CommonMethodsService,
    LoggerService,
    SbUiResolverService,
    {
      provide: ENVIRONMENT,
      useValue: environment
    },
    {
      provide: 'environment',
      useValue: environment
    },
    {
      deps: [InitService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
