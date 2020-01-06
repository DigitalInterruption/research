---
layout: post
title: Smart (business) Cards
tags: [NFC, Android]
---

Business cards are yet another thing that can be added to the ever growing list of "smart" products; and for actually in my option, for a good reason too. With a tap of the card, it's possible to launch web sites, share always up-to-date contact information, link to a mobile app, or perform many other actions that could be useful when networking in 2017.

Like with all smart devices, it is important security is considered. In this post, we will look at the things to consider when sharing (or even accepting) someone's NFC (Near-field Communication) enabled business card. Although an android device is used in this post, any NFC reader/writer (including iPhone) can perform the same actions.

In order to understand the attack surface, we should understand how these cards work. Although the idea of smart business cards is not new (most phones can share contact details electronically), we now are seeing paper business cards with embedded NFC chips and that is what we will discuss in this blog post.

NFC is a well understood technology that can allow two devices to communicate and share information over short range. In fact, NFC is now so popular most modern smartphones come with a NFC chip, allowing things like contactless payments and secure bluetooth pairing. With NFC enabled business cards, it's possible to tap a card on an NFC enabled smart phone and perform an action such as displaying a web page.

Here, a NFC enabled business card is used to open the browser to a web page with the displaying contact information (Personally Identifiable Information removed):

![]({{ site.baseurl }}/assets/img/2017-04-17-smart-business-cards/1.png)
 
With an application like NFC Tools on Android, it's possible to read the full contents of the NFC card, including the URL that is opened on the reader (Record 0 - again, PII removed).

![]({{ site.baseurl }}/assets/img/2017-04-17-smart-business-cards/2.png)
 
It can also be seen that although the card supports being locked by setting to to Read-Only mode, this card is writable. Although passwords are supported in this tag type, for the use case of a business card, it would not make sense have it set.

As the card is writable, it would be possible to change the value of the data stored on the card. This could be done by an attacker with the ability to tap the card with their NFC enabled smartphone whilst retrieving contact information.

Here, we use the same NFC Tools app to rewrite Record 0 to our favorite youtube video.

![]({{ site.baseurl }}/assets/img/2017-04-17-smart-business-cards/3.png)
 
![]({{ site.baseurl }}/assets/img/2017-04-17-smart-business-cards/4.png)
 
There are several payloads on attacker may want to place on the cards, depending on their goals. By simply replacing the data to something embarrassing, a fair amount of reputational damage could occur, especially if these cards are unattended for a time. For example, the website that sold these particular cards suggest using them to share directions to a party or event but these directions could easily be changed. The URL to your contact information or website could be changed to other particularly embarrassing websites - imagine the look on people's faces as they tap your card at a networking event.

A more malicious use case could be to add a payload that would exploit a vulnerability on the device that reads the card. This could potentially be used to gain full control over a device (this has been demonstrated multiple times in the past via NFC exploits, browser exploits or using NFC to launch other vulnerable apps ) and while most users will not scan random NFC tags, there is often more trust and desire to do so at a networking event where these cards are likely to be used.

After getting in touch with the company that made the business cards, they had this to say:

"We definitely appreciate your concern regarding our NFC chips. We are currently aware of their writable status. This allows customers the freedom to have the actions and function of their NFC chips edited not only by us but a 3rd party application if they choose to after ordering. It can provide them with more options. It can also help assure that after production any errors or performance issues can be corrected without having to replace them.

Customers do have the ability to lock the chip from further access at any point after production if they choose.

I hope this addresses your concerns. Please let us know if you have any other questions.

Best regards,"

After reviewing these cards, it is recommended that should you purchase NFC business cards the advice of the seller should be followed. These cards should be locked and set to Read Only before being used. The advice to those being asked to tap NFC enabled cards cards is to do so with care and make sure your device is up to date to protect against known vulnerabilities.
