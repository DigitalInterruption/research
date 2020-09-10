---
layout: post
title: Giggle; laughable security 
tags:
  - Android
  - Responsible Disclosure
  - Vulnerability 
image: /assets/img/2020-09-10-giggle-laughable-security/GigglingEmoji.jpg
---
Preface: There is very little in this blog post that is interesting from a technical perspective. The discovered vulnerability is incredibly basic but fairly high risk. Due to the nature of the application, and the fallout from our disclosure attempt, we wanted to write up our findings. The TL;DR is that giggle has been exposing user's phone numbers, private images and location to the world.


Normally we wouldn't post a vulnerability like this so soon after discovering it but the owner of the app refuses to listen to us and continuously claims no vulnerability exists. We tried to get in contact with her via a third party (after we had been blocked) to let her read this post before publishing it but, again, she showed no interest.

(edit: The issue has now been fixed.)

--- 

### What is Giggle?

This week I set up an account on an app called giggle. You see, last month I had been diagnosed with premature menopause I and wanted to find a safe space in a woman centric environment. Somewhere I could talk openly about this experience and maybe get some support, but also find some light hearted way to socialise online. 

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image1.jpeg.resize.jpeg) 

Without much investigation I found giggle, which seemed to check all the boxes. A free app, promoting safe and secure social networking. Giggle promised a refuge from misogyny and sexism where I could find support and community. 

There were a few red flags, such as an excessive use of pink and word “females”, but I decided to give it a go. 

At this point the red flags became a little more crimson. Firstly, I was asked to submit my phone number so that a verification code could be sent to my mobile. Then I was asked to allow the app to access my camera so that a selfie of me could be submitted to verify I was female. This verification, apparently, is done using AI. From previous work done on this, we know this can often be notorious for mischaracterising and therefore excluding certain racial groups, some trans women and some masculine looking women. 

The app assured me that my verification picture would not be stored so not to worry about what I looked like, so my gargoylesq visage was submitted (I’ll get to the later) and I was duly approved to enter the app. 

I went to set up my profile to see what information was publicly available about me, even if only in the app, to find there wasn't one and I had to set up multiple profiles or ‘giggles’ to start a tinder like experience on each specific subject I was interested in (I chose menopause, body image, hiking and wine tasting), that range from socialising and hobbies to more high risk areas such as abuse and sex work. 

As I was curious how secure my data was, and as we are currently working on improvements to [REX](https://rex.digitalinterruption.com/) (and thought they’d maybe like a [free license](https://www.digitalinterruption.com/100-free-rex-licences)), we decided to dig a little deeper. 

### Viewing Account Details

Using BurpSuite and a fresh install of the app, we intercepted the network traffic and found a few interesting things that we decided not to look at further as we didn’t have permission to do a full analysis. During the registration process, as mentioned, users are required to verify a phone number and selfie. We submitted a selfie that wouldn’t pass and, unsurprisingly, couldn’t gain access to giggle.

Looking at the network requests revealed that although the account was in an unvalidated state, we still had a valid auth token (it turns out this is hardcoded into the application) allowing us to make requests to the API. Again, we didn’t perform a full analysis although we suspect issues could exist here. What we did look at was the UserList endpoint. This contained a filter parameter that contained my phone number, an operator (in this case "equals") and a field ("mobile"). Presumably, this is how a user’s account details are fetched from the API. 
 
![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image2.png.resize.png)

Of course, the obvious question is what would happen if we changed this filter parameter to be another phone number, changed the query to filter on another parameter such as user ID or user’s name or even would it remove the filter altogether, allowing us to view all accounts? 

First, we decided to change the filter query so it would filter based on the GUID of the original account which we received during our initial analysis. This brought back the original account details which included the user’s phone number, age (which was set to hidden) and a latitude and longitude. 

Request:

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image3.png.resize.png)
 

Response:

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image4.png.resize.png)

Having the phone number is bad enough, but we checked the returned latitude and longitude using Google Maps. Of course, this brought us to the very house I created the account in.
 
![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image5.png.resize.png)

This means an attacker that is completely unverified to the application can view the address and phone number of all users if they have the account ID. That is pretty bad in our opinion.

Next, we wanted to be able to download the same details without knowing the account ID. Looking at the filter parameter, it’s clear to see there would be many ways to do this. We could remove the filter completely although that would reveal other accounts to us which we were trying to avoid seeing or we could change the query to show all accounts not matching a phone number. As a proof of concept, we decided to change the operator field from “equals” to “contains” and truncated the GUID. As this returned the same data, it should be obvious to see how the query could be trivially modified to expose all registered accounts with no prerequisite account knowledge.

Request:
 
![Burp Web Request]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image6.png.resize.png)


### Selfies!

What about the supposed private picture that is used to verify accounts? They claim not to store? Behold my gargoylesq visage!
 
![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image7.png.resize.png)

If we look at the URL of the verification image (which we recovered by viewing network traffic in BurpSuite), we can see that the only thing that is required in the user GUID. As we can view the user GUID for every account (e.g. our test account) we can easily download the associated verification selfie. Although this is not terrible on it’s own, giggle do promise that this isn’t shared or published, and, given that it is available data stored along side my mobile number and geographical coordinates, with this information an attacker would know my address, my personal mobile number and what I look like. 

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image8.jpeg.resize.jpeg)

This is where we get to the really scary bit. Giggle has sections encouraging women to find support on abortion, abuse, addiction and relationships among other categories. The amount of available data means that with a phone number or name, an abusive partner would potentially be able to find the location of an abused woman and confirm her identity with the verification picture. There is also a section for sex workers, who, understandably would expect any app enabling them to advertise their work to have adequate privacy and security controls. Even if a user deletes their account, that data appears to still be saved by giggle. 

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image13.jpeg)

### Account Deletion

The final thing we looked at is whether a deleted account is actually deleted. We deleted the original account using the “Delete Account” button and tried to view the associated account details.

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image9.jpeg.resize.jpeg)


![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image10.png.resize.png)

Of course, they are still present and only set to Disabled meaning they are still stored by the system. Maybe accounts are deleted periodically. We would normally at this point reach out to the vendor and ask for clarification. This leads us to the next part of the story...

### Disclosure

We wanted to let giggle know that this vuln existed and ask for some further details, not in the small part because it is so easy to exploit. In the midst of this we had done some digging on the origins of the app and found that the founder had a very public anti-trans agenda. However, much as this sickens us, our job is to protect users so we direct messaged giggle through twitter. 

![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image11.png.resize.png)

Having had no response, we decided to send them a tweet asking them to check their DMs with their founder cc’d in, but with a caveat that we do not share or endorse her anti-trans views. 

 
![]({{ site.baseurl }}/assets/img/2020-09-10-giggle-laughable-security/image12.png.resize.png)

That’s when we were dragged into a full on TERF War. 

Our public tweet had no engagement at all until Sall, the giggle founder, decided to share a screenshot of it with her followers. We have since been subject to a tirade of abuse. None of it about the security of the app. Interested parties are free to view our twitter and find the hundreds and hundreds of tweets in response to trying to disclose this vulnerability but we decided not to copy that into this post.

Our founders have reached out to giggle and Sall and have been blocked following every attempt at contact. Our three year incorporated company has been accused of being a creepy bloke who runs private WhatsApp groups full of naked women, a front for the alt-left, making up the vuln to discredit Sall and her company and hypocrites for wanting to protect the data of users despite the apps founder having view that counter our own.

Our company and I (a woman) have been accused of being a man, and therefore a misogynist multiple times. We have been told that as men (60% of Digital Interruption are women), we should not have a say on the safety of women and their personal data. 

Sadly, denial is not uncommon when trying to disclose. We are used to being ignored and even getting some pushback, but ultimately we feel it is our responsibility to persist and ensure the personal data of users is protected. 

What has been staggering is the viciousness of the gender critical and “pro-women” community and how quick they are to go on the attack with so little background information, a total disregard for the safety of users (in this case women in their own community) and seemingly no understanding of information security. Sall has several times said no vulnerabilities exists without letting us give her details, instead choosing to believe we're making it up to hurt her reputation.

Our hearts go out to the people who deal with this kind of abuse on a daily basis and we will continue to stand up for trans rights. 

Finally, what does this mean for the users of Giggle. Unfortunately, your location and phone number (and verification selfie) are open to the public. We recommend asking giggle to address these issues or asking them to delete your account. Note that using the “delete” button in the application is not enough.

### Disclosure timeline:
- **07/09/2020**: Reached out privately via Twitter DM
- **09/09/2020**: Publicly reached out via Twitter
- **09/09/2020**: Continued DM with giggle owner, Sall
- **09/09/2020**: DI_Security Twitter account blocked
- **09/09/2020**: JayHarris_Sec Twitter account blocked
- **09/09/2020**: Saskia asked Sall to reconsider ignoring us
- **09/09/2020**: ms__chief account blocked
- **09/09/2020**: Journalist contacted. Ignored by giggle
- **10/09/2020**: Giggle finally asked for more details 
- **10/09/2020**: Vulnerability fixed 





