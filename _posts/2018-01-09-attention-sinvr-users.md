---
layout: post
title: Lack of Authentication Leaks Customer Details in SinVR - An Adult VR Application
tags: [hacking, vr, sinvr, virtual reality, thick client, vulnerability]
---
Despite initial thoughts, pulling robots apart and killing zombies does eventually get boring so I decided to see what else could be done in Virtual Reality. When looking for other interesting VR applications, one kept coming up as recommended on sites such as reddit; SinVR. Honestly, it was a little underwhelming so instead my night was spent pulling it apart. Who knew that decompiling an application would be more interesting than virtual women?

(So, the story above is a bit of a lie. Jumping on the bandwagon of hacking sex toys and teledildonics, Digital Interruption thought it was worth taking a look at the VR angle).

During this research, we found a high risk vulnerability in the SinVR application that leaked customer information and several deviations from security best practice. Initially we planned on releasing this post after the vulnerabilities were fixed, however after several attempts we were not able to contact the company behind SinVR. We tried emailing the addresses we could find, sending private messages to their (active) reddit account and reaching out via Twitter.

Due to the nature of the issues found, we made the tough decision of bringing one of the issues to the attention of the public in order to warn users their data was not being protected adequately.

Other vulnerabilities that do not directly impact users will be released soon but we'd like to give the developers of SinVR time to fix them should they wish.

The issue presented in this post will allow an attacker to download details (including names, email addresses and device (PC) names) for everyone with an account as well as download details (again including names, email addresses and device names) for those users that have paid for content using PayPal. As this is quite a lot of PII, not only could an attacker use this to perform social engineering attacks, but due to the nature of the application it is potentially quite embarrassing to have details like this leaked. It is not outside the realm of possibility that some users could be blackmailed with this information.

To reduce the risk to the customers of SinVR, we have obfuscated the details of the attack where possible.

When reversing the application, we noticed a function which looked like it would allow the application to download a list of all users and another that would download all users that had used PayPal to purchase scenes. Although we weren’t able to trigger this function from the application itself (it would have been possible by modifying the binary), by looking at how the web API worked, it was possible to make a call to these endpoints manually.

The results of this can be seen in the following screenshots.

![](/assets/img/2018-01-09-attention-sinvr-users/1.png)

![](/assets/img/2018-01-09-attention-sinvr-users/2.png)

As there is no authentication on the endpoint, it would be possible for an attacker to download a full list of users of SinVR. During testing, Digital Interruption only downloaded enough users to prove this was an issue by finding our own account.

Until this is addressed, we would not recommend anyone using this application unless they are okay with this type of information being made public.

## Disclosure Timeline
- 28th Dec 2017 - Contact SinVR via email. No response.
- 29th Dec 2017 - Follow up via e-mail
- 4th January 2018 - Follow up via reddit
- 8th January 2018 - Reached out via Twitter

**Update:**
We were contacted by a SinVR employee on 15th January 2018 who stated they had fixed the issue. We retried our tests and can confirm we were no longer able to access customer data.
