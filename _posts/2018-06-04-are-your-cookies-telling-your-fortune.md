---
layout: post
title: Are Your Cookies Telling Your Fortune?
tags: [hacking, cookies, cve]
---
Earlier in the year, we carried out some research into the use of weak cookie secrets in Express.js powered web applications and how information gathered from OSINT can be used to attack said applications.

Using Shodan, we were able to find 8,190 hosts which appeared to be using the cookie-session middleware for Express.js, using it’s default setting for the session name (i.e. session).

![]({{ site.baseurl }}/assets/img/2018-06-04-are-your-cookies-telling-your-fortune/1.png)

In addition to scraping Shodan for cookies, we also scraped data from several websites that allow users to publish code. One source which had a particularly alarming number of publicly disclosed secrets was GitHub – yielding a total of 1,979,689 results in JavaScript projects.

![]({{ site.baseurl }}/assets/img/2018-06-04-are-your-cookies-telling-your-fortune/2.png)

Using the cookie data harvested from Shodan, and the leaked secrets found using OSINT, an analysis of the collected data was carried out using a utility we created to brute force cookie secrets – [Cookie Monster](https://github.com/DigitalInterruption/cookie-monster).

Cookie Monster is able to take a collection of cookie samples and execute a brute force attack against them in an attempt to reveal the cookie secrets.

![]({{ site.baseurl }}/assets/img/2018-06-04-are-your-cookies-telling-your-fortune/3.png)

An alarming trait amongst a number of the hosts that were using weak secrets was the use of Passport.js – a middleware package used for providing authentication strategies; meaning these hosts were highly susceptible to authentication bypasses and privilege escalation.

![]({{ site.baseurl }}/assets/img/2018-06-04-are-your-cookies-telling-your-fortune/4.png)

Of the hosts that were identified as being vulnerable, “secret key” was the most widely used secret key, accounting for 72.58% of the revealed secrets; followed by “keyboard cat”. Both these secrets were found to be prevalent in a lot of samples found in documentation and online tutorials.

![]({{ site.baseurl }}/assets/img/2018-06-04-are-your-cookies-telling-your-fortune/5.png)

In an attempt to help the affected hosts, we reached out to all hosts that we were able to acquire contact information for. We were able to successfully identify the ownership of 41 hosts, which were in use by 19 separate organisations.

Of the 19 organisations contacted, 2 resolved the issue, 2 acknowledged the issue but did not take the necessary action and 15 did not respond to our outreach.

Amongst these results, were two open-source projects that stored the secrets as hard coded values; meaning all users of the software are currently vulnerable to the attack. We reached out to the listed collaborators of these projects to offer information on how to patch the code, but were unsuccessful in acquiring a response or a patch to be published.

In lieu of a patch from the vendors, we have opened pull requests on their respective GitHub pages, providing a patch to the issues:

* [CVE-2018-10813](https://github.com/aprendecondedos/dedos-web/pull/1)
* [CVE-2018-10966](https://github.com/GamerPolls/gamerpolls.com/pull/56)

For more information on how this research was executed, and for examples of how Cookie Monster can be used in aiding the testing of Passport.js websites to achieve authentication bypass and privilege escalation, check out the [full white paper](https://file.digitalinterruption.com/Are_Your_Cookies_Telling_Your_Fortune.pdf).

## Timeline
* **1st May 2018:** Begin identifying hosts and reaching out with disclosures and requests for technical contacts were appropriate
* **8th May 2018:** CVE-2018-10813 assigned for dedos-web vulnerability
* **10th May 2018:** CVE-2018-10966 assigned for GamerPolls vulnerability
* **1st June 2018:** Public disclosure of CVE-2018-10813 and CVE-2018-10966. Patches for both projects submitted via GitHub
