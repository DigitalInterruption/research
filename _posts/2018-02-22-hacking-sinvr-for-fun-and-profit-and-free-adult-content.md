---
layout: post
title: Hacking SinVR for Fun and Profit and Free Adult Content
tags: [sinvr, vulnerability, virtual reality]
---
In December, we raised an issue with inVR (the company behind the adult VR application - SinVR) where a vulnerability allowed us to view some details of customers that were using the application. During our research, we noticed another interesting vulnerability but as customer details were not at risk, we decided to wait before publishing this post. Initially, inVR said they were not interested in fixing this vulnerability however, after reading an initial draft of this post they asked for two weeks to fix the issue.

This vulnerability would allow users to unlock all (paid) content in the application. It’s likely other avenues to view content exist. however we hope that this article will help anyone developing software to be aware of any client side validation used to protect content.

During the initial review of this application, we noticed a lot of content was set to “forbidden” within the application with only one sample available for free.

![]({{ site.baseurl }}/assets/img/2018-02-22-hacking-sinvr-for-fun-and-profit-and-free-adult-content/1.png)

Any experienced penetration tester or hacker would ask themselves “how does the app know what is available to the user and what isn’t?”. To try and answer this question, we started a proxy server to capture the network traffic. Looking though the results we were unable to see anything that set content to available/forbidden which lead us to believe the check was performed locally within the application itself. We wanted to find out whether this was true and to see whether we could set the state to “purchased”.

Although the main application is a x64 program, there were a number of .net assemblies in one of the directories. As .net is significantly easier to reverse than x64, we decided to start there.

Whilst decompiling the application, we noticed a section of code that dealt with coupons. We quickly located this feature in the application.

![]({{ site.baseurl }}/assets/img/2018-02-22-hacking-sinvr-for-fun-and-profit-and-free-adult-content/2.png)

![]({{ site.baseurl }}/assets/img/2018-02-22-hacking-sinvr-for-fun-and-profit-and-free-adult-content/3.png)

Looking though the code, it looked like there were three types of valid responses from the server when a coupon is submitted. These are `invalidCode`, `expiredCode` and `unlimited`. When a response from a valid coupon comes back from the web server, the SinVR app unlocks the content specified in the response, allowing it to be selected from the menu. Because of this, it’s likely coupons are created for specific scenes. There is a coupon type where the behaviour is different though and that is the “unlimited” coupon code. If an unlimited coupon is used, all scenes in the application are set to be unlocked.

As we don’t know the coupons we have two choices, bruteforce one or trick the app into thinking we submitted one. As we don’t know the format of the code, performing a bruteforce could be noisy, slow (depending on any security controls in place) and might not return anything useful.

After entering an invalid code however, we can see a response is returned as follows:

```json
{"result":"invalidCode"}
```

This makes sense given the code we read and what we know about the response types.

In burpsuite (the proxy software we were using) it’s possible to modify the response to a request although in order to reduce the number of requests to the web service (as this might be detected), we created a simple web server for testing that would respond with what we wanted.

The following python was written to create our web server and using burpsuite, we redirected requests the now running local server.

```python
#!/usr/bin/env python
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        self._set_headers()
        self.wfile.write("{\"result\":\"unlimited_100\"}")

def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
```

As can be seen, the server responds to all requests with:

```json
{"result":"unlimited_100"}
```

This caused the application to respond as follows

![]({{ site.baseurl }}/assets/img/2018-02-22-hacking-sinvr-for-fun-and-profit-and-free-adult-content/4.png)

As suspected, all assets are set to “Enter”. In a lot of cases, there would be additional checks on the server to make sure a user is allowed to view the content they requested however in SinVR, this authentication check is not performed. This allows anyone to download content assuming the application says it’s allowed.

There are a number of other ways one could go about performing this same attack such as patching the application, responding with a list of unlocked assets when sending a login request etc. however, this was the easiest way we found to launch this attack.

## Timeline
* 15th Jan 2018 - Reported to vendor and we were we could publish before a fix.
* 28th Jan 2018 - Draft report sent to vendor. We were asked to hold publishing until fix was applied.
* 9th Feb 2018 - Fix deployed.
