---
layout: post
title: Multiple Vulnerabilities Found in Mobile Device Management Software
tags:
  - android
  - ios
  - mdm
  - hacking
  - websec
  - CVE-2018-15655
  - CVE-2018-15656
  - CVE-2018-15657
  - CVE-2018-15658
  - CVE-2018-15659
image: /assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/thumbnail.png
---

A few months ago during a penetration test, we stumbled upon a Windows based mobile device management [MDM] system named SureMDM. MDM systems aim to provide an efficient means of managing a large number of mobile devices, ensuring that they are all configured to the same standard and kept secure.

The customers section of the vendor's website boasts quite the impressive list, including organisations such as AT&T, Facebook and Siemens, to name a few. With a wide user base, it was presumed the system would be quite extensive and have a larger attack surface to explore.

Initially, there was not a great deal presented to us. Pretty much the entire system required authentication and we had no credentials. However, there were two dangerous misconfigurations that allowed cross-origin requests; which were the first of several vulnerabilities, that when combined with other issues that were found, could lead to a severe compromise.

### Weak CORS Configuration: CVE-2018-15655
The first of the misconfiguration issues was in the CORS policy. The CORS policy would allow requests to be made from any origin. As a result of this, if an attacker was able to lure a user to a website that they either control or have compromised in some way, they could effectively carry out any action as the victim and exfiltrate sensitive data.

To confirm this, we hosted a small proof of concept on one of our servers, the markup for which can be found below:

```html
<html>
<head>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</head>
<body>
  <pre class="remote-content">
  </pre>

  <script type="text/javascript">
    var url = (location.search.split('url=')[1] || '').split('&')[0]
    $.get(url, null, function (data) {
      $('.remote-content').text(data)
    }, 'text')
  </script>
</body>
</html>
```

This page will attempt to load the address provided to the `url` query string parameter, and display the data on screen. If a URL is requested from a website with a secure CORS policy, it will result in an error, as can be seen in the below screenshot when requesting a resource from Google:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/secure-cors.png)

However, when changing the URL to one being served by the SureMDM system, the request is successful and the content available to be processed:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/insecure-cors.png)

### Weak Silverlight Access Policy: CVE-2018-15659
Much like the weak CORS policy, the weak Silverlight access policy meant that a request could be made from any origin via a Silverlight application. To test this, we used [This PoC from NCC Group](https://github.com/nccgroup/CrossSiteContentHijacking).

When a resource served by SureMDM was specified as the target page, the Silverlight application could successfully access the resource from a different origin:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/silverlight-poc.png)

### Incorrect Access Control: CVE-2018-15658
After discovering the cross-origin issues, we were left with only theoretical scenarios to present to the client as we weren't sure of what could be achieved from the web UI; then we came across `/console/ConsolePage/Master.html`.

As one would expect from a page that requires authentication, when we tried to access this, we were redirected back to the login page - something was not quite right though. When reviewing our request history - there was no sign of any responses with a [3xx code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection).

This prompted us to take a look at the request being made to `Master.html` and revealed that the session validation and redirection was being carried out in the JavaScript as the page is loaded. The result of this? We were able to see the markup that would be presented to an authenticated user:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/console-markup.png)

Upon examining the markup, we were able to gather links to unprotected resources which when pooled together revealed over 100 different API endpoints. These endpoints included functions to carry out a number of highly sensitive actions, such as:

* Retrieve call logs from a managed device
* Retrieve SMS logs from a managed device
* Manipulate device blacklists / whitelists
* Retrieve and manipulate user account data

With so many API functions available, the CSRF vulnerabilities that were previously identified were of a much higher severity, putting the mobile devices being managed by SureMDM and the MDM system itself at risk of compromise.

### Unauthenticated Information Exposure: CVE-2018-15656
At this point, we had several highly sensitive resources as well as two vulnerabilities that could be used to reliably carry out cross-site request forgery attacks. To add to this, we were able to identify an API endpoint which did not require authentication and would confirm whether a specified e-mail address is registered against a user account within the SureMDM system.

By making a `GET` request to `/api/register/$1`, where `$1` is a base64 encoded e-mail address, the web server will respond with either `true` or `false` in the response body, indicating that the e-mail is in use or not.

In addition to specifying the e-mail address, it was also required that a `ApiKey` header be declared with the value `apiKey`. For example, to verify whether `jenny@8675309.ext` exists in the system, the below request would have to be made:

```http
GET /api/register/amVubnlAODY3NTMwOS5leHQ= HTTP/1.1
Host: 127.0.0.1
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0
Accept: application/json, text/javascript, */*; q=0.01
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://127.0.0.1/console/?16.0
Content-Type: application/json; charset=utf-8
X-Requested-With: XMLHttpRequest
Content-Length: 0
Connection: close
ApiKey: apiKey
```

By utilising this information exposure, it further increases the chances of a successful phishing campaign paired up with the CSRF vulnerabilities.

### Server Side Request Forgery: CVE-2018-15657
Lastly, we were able to identify another unauthenticated endpoint which posed a more significant issue than the one documented in CVE-2018-15656. The resource we identified can be found at `/api/DownloadUrlResponse.ashx` and accepts user input via a query string parameter named `url`.

The URL provided in the `url` parameter will subsequently be requested by the web server and the content output in the response to the user. This opens up the possibility of cross-site scripting attacks, with complete evasion of the default protections in several browsers, as no markup is being passed via the URL; but rather the address of the resource to load:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/rfi.png)

In addition to being able to serve remote files from the SureMDM host, it was also possible to use this SSRF vulnerability to serve files from the local filesystem of the server. As the URI schema is not validated, `file://` URIs can be passed in the `url` parameter, such as `file://C:/WINDOWS/System32/drivers/etc/hosts`:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/lfi-hosts.png)

After enumerating some older documentation of SureMDM that we were able to find online, we identified the default install path of the IIS application, and confirmed  that the vulnerability can be used to recover the SQL server credentials and other sensitive pieces of information within the `Web.config` and `webConnection.config` files:

![]({{ site.baseurl }}/assets/img/2019-01-31-multiple-vulnerabilities-found-in-mobile-device-management-software/lfi-connections.png)

### Disclosure Timeline
- **2018-08-21**: Contact vendor to request contact information of an appropriate member of staff to disclose vulnerability information to.
- **2018-09-06**: Contact vendor again due to no response to initial e-mail.
- **2018-09-24**: Contact vendor again due to no response to any previous e-mails.
- **2018-09-25**: Response from vendor and disclosure of all vulnerabilities along with suggested remediation steps.
- **2018-11-27**: Vendor issued patch and began reaching out to their customers to push the patch on to their systems.
- **2019-02-01**: Disclosure made public
