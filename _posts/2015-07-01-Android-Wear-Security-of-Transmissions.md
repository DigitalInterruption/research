---
layout: post
title: Android Wear; Security of Transmissions
tags: [Bluetooth, Android]
---
Following on from my previous research into Android Wear[1], a question is often asked by those worried about the security of wearables: “how secure is the data transmitted between the watch and the phone?”. This post aims to answer that question and provide some details on where and how sensitive data may be leaked when using or implementing Android Wear applications. The security controls implemented by Android to stop malicious applications or users from accessing sensitive information will also be discussed where relevant.

This research was performed using the following hardware and software configuration:

LG G running:
- Android 5.1.1
- Google Play Services 7.5.76
- Android Wear 1.1.1.1929539

Moto G running:
- Android 4.4.4
- Google Play Services 7.5.74
- Android Wear 1.1.1.2016316

# Bluetooth

The most passive approach to recovering any sensitive information sent between the phone and the watch is to monitor the physical layer, and so this analysis was started by looking at the Bluetooth link. Android Wear uses Bluetooth 4.0 for communicating data between the phone and the watch. When discussing Bluetooth 4.0, many people make mention of the weaknesses in Bluetooth Low Energy as presented by Mike Ryan[2]. During this research, however, I was surprised to discover that Bluetooth Low Energy was not being used when sending Android Wear messages, side stepping some of the risk involved with Bluetooth Low Energy pairing.

Android Wear uses Secure Simple Pairing with Numeric Comparison as the association model. This approach allows users to identify and pair Android Wear devices by visually comparing a six digit PIN which appears on the screen of both devices. After inspecting the PIN, the user has the choice to either cancel or continue with pairing, depending on whether the PINs match. Prior research by Bitdefender [3] implies that this six digit pin is used to encrypt or obfuscate the Bluetooth traffic. My findings show that this is not accurate as the PIN is solely used to provide protection from Man in the Middle attacks and is generated as an artefact of the security algorithm and not as input to in. From the Bluetooth 4.0 Core Specification, “Knowing the displayed number is of no benefit in decrypting the encoded data exchanged between the two devices” [core spec page 87].

With an Ubertooth One, it can be confirmed that Bluetooth traffic is not sent in plaintext between the Watch and the Phone and that Bluetooth Low Energy is not in use. Unless further weakness are discovered in Bluetooth 4.0, it is likely that an attacker would not be able to recover messages by capturing Bluetooth traffic.

# HCI Logging

Google introduced HCI Logging in Android 4.4, giving developers the ability to capture Bluetooth HCI traffic sent between Android and Bluetooth devices. By enabling this logging, it is possible to see whether Android Wear applies any application level encryption before sending data over a Bluetooth connection.

After enabling HCI logging, a demo notification is sent between the phone and the watch. By viewing the hci log file created on the sdcard, it can be seen that the entirety of the Android Wear notification is sent in plaintext. This shows that although encrypted over the air, no application level encryption exists for Android Wear messages. During this piece of research, I developed an application with the READ_EXTERNAL_STORAGE permission [4]. As suspected it was possible to recover all Android Wear messages on a device with HCI Logging enabled. The risk of this attack is minimal, however, as an attacker would first need to enable hci logging and install malware on a target device. Prior to Android Wear L, no lockscreen had been implemented and so and attack of this nature would have been more feasible. With a lockscreen enabled, an attacker with physical access to an Android Wear device without no knowledge of the unlock code, would no longer be in a position to enable Bluetooth logging.

Developers looking to send sensitive information between Android and Android Wear should consider applying additional encryption on these messages as an adversary able to recover the HCI log will be in a position to recover everything sent over Bluetooth. For extremely sensitive information, or when encryption cannot be applied, consider checking for the presence of the HCI log file (/sdcard/btsnoop_hci.log) and/or setting and only sending data if the log file is not present.

# Logcat

Although logged in the hci snoop logs, I was keen to understand where else logging of Android Wear messages may occur. Android provides Logcat; an application for viewing the log output of running application. This is useful for both developers and hackers. Running Logcat on an Android device whilst sending notifications to its Wearable component showed no logging of Android Wear messages. After reverse engineering the Google Play Services, it was shown that many of the logging within Android Wear often took the following form:

something like:
```
if(log.TAG)
    log(TAG)
```

Looking through the decompiled source code, it was possible to discover several logging statements and their relevant tags.

By enabling logging on these tag, it can be seen that the Android Wear messages do indeed appear in logs. These can be viewed by running Logcat on the Android device (either the phone/tablet or watch). This can be done by running the command setprop log.tag.datatransport VERBOSE on the device.

Whilst interesting, it should be highlighted that Android does provide security measures that stop non privileged applications from viewing these logs so to view these logs. An attacker would either need physical access to a device with adb enabled, or have malware running with root access.

As with HCI log snooping, it may be possible for an attacker to view sensitive information sent to Android Wear applications with this method. If dealing with sensitive information, developers should consider applying additional encryption on top of messages to protect them from leaking in logs. As it is not possible to stop logging of this nature, applications dealing with particularly sensitive data can consider performing root checking. By refusing to run on a rooted device, applications can ensure that only those with physical access can view the data present in Android logs.

# Conclusion

When developing Android Wear applications, data integrity and confidentially of the Android Wear messages should be considered. Although encrypted over the air, anything sensitive should have additional encryption applied before it leaves the application. A defence in depth approach to development should assume a future attack will allow an attacker to recover Bluetooth keys and should make steps to protect users and their data.

As shown in this post, there are numerous ways in which data can inadvertently be leaked to an attacker or curious user. Although Android provides many protections from external threats, Android developers should consider applying additional protections with highly sensitive data when developing for the Wear platform. By performing checks for hostile environments (such as rooted devices, or devices with hci_snoop log enabled) it is possible to protect against the threat of malware, as well as the curious or malicious user.

[1] <https://labs.f-secure.com/archive/android-wear-security-analysis/>
[2] <https://lacklustre.net/>
[3] <http://www.darkreading.com/partner-perspectives/bitdefender/bitdefender-research-exposes-security-risks-of-android-wearable-devices-/a/d-id/1318005>
[4] <https://github.com/jahmelharris/read_hci_log_android>
