---
layout: post
title: How Does The SDK Version Affect The Security of Android Applications?
tags: [android rce webview minsdkversion development programming]
image: /assets/img/2019-01-25-how-does-the-sdk-version-affect-the-security-of-android-applications/thumbnail.png
---
We were recently tasked with determining what effects the use of the `minSdkVersion` property within Android projects has on the security of the application; specifically whether or not it can result in a downgrade attack of the runtime environment.

In the case we were asked to look into, the application targetted a recent SDK version but also utilised a library which was targetting a much older SDK version, with several high severity vulnerabilities.

The question we set out to answer was whether or not:

1. The lower `minSdkVersion` of the library could force the application to run in the context of the older API
2. A lower `minSdkVersion` specified at applications level will force the Android runtime to run in an older context

## Creating a Vulnerable Application
To determine how the SDK version affects an application, a small application needed to be put together which would contain a vulnerability that was mitigated at the OS level in a later version. For this test, we chose [CVE-2012-6636](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-6636); the vulnerability that allows code execution via the JavaScript bridge and reflection in API versions prior to 17.

The vulnerable application consisted of a single activity which launches another activity contained within a library which contains the following code:

```java
package com.digitalinterruption.api15library;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class WebViewActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_view);

        WebView webView = (WebView) findViewById(R.id.webView);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new JavaScriptInterface(), "jsinterface");
        webView.loadUrl("http://192.168.1.157:4444/GEpBE2VaPK26N4");
    }

    final class JavaScriptInterface {
        JavaScriptInterface () { }
        public String getSomeString() {
            return "Return value of JavaScriptInterface.getSomeString";
        }
    }
}
```

Upon launching this activity, a page being served by Metasploit would be loaded into the WebView and if vulnerable to [CVE-2012-6636](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-6636) would result in a remote session on the Android device.

## Test 1: Matching API Levels
The aim of this test was to determine if a matching `minSdkVersion` across the vulnerable library and the application using it will result in differing behaviour across an Android device at API level 15 vs API level 27.

When the application was run in an AVD using API 15, the exploit was successfully executed and resulted in a remote shell; as can be seen in the video below:

<video autoplay="true" loop="true" src="{{ site.baseurl }}/assets/videos/2019-01-25-how-does-the-sdk-version-affect-the-security-of-android-applications/api15.m4v"></video>

When run in the API 27 virtual device, the page loaded into the WebView instead displayed a generic 404 error page:

![]({{ site.baseurl }}/assets/img/2019-01-25-how-does-the-sdk-version-affect-the-security-of-android-applications/404.png)

Back in the Metasploit console, we could see the 404 page was sent as a result of Metasploit failing to find a vulnerable JavaScript bridge:

![]({{ site.baseurl }}/assets/img/2019-01-25-how-does-the-sdk-version-affect-the-security-of-android-applications/msf-error.png)

This means that despite the lower `minSdkVersion` present in both the library and application's Gradle files, the functionality never runs in any form of compatibility mode to make it function as it did in an earlier version of the API.

## Test 2: Lower Library API Level
Although the first test confirmed what we believed would be the case (that the downgrade attack would not work), for completeness, we tested against the use-case that was originally proposed to us - an application with a higher API level using a library with a lower level.

First, we tweaked the Gradle build file of the application to make it instead require API level 27 or higher:

```gradle
android {
    compileSdkVersion 27
    defaultConfig {
        applicationId "com.digitalinterruption.apileveltest"
        minSdkVersion 27
        targetSdkVersion 27
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

With the library still requiring a minimum API level of 15 and the application requiring 27, we deployed the application once more to the API 27 AVD and witnessed the same failure as in the previous test.

## Summary
When working with the Android API, changing the API level of the application will not result in the functionality being unified across different Android builds. The API level you define in your Gradle build is used only at compile time / to flag to your IDE appropriate notifications and advice (such as insecure usage and deprecation warnings).

For this reason, you should consider carefully your design decisions and be aware of any potentially dangerous vulnerabilities from previous releases that could impact your application's ecosystem, should you choose to continue supporting older devices.
