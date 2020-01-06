---
layout: post
title: How Can The Industry Blame Less and Support More?
tags:
	- Bluetooth
---
# Bluetooth Low Energy
Bluetooth Low Energy (also known as Bluetooth Smart or, incorrectly, Bluetooth 4.0) is a new standard of wireless communication introduced as part of the Bluetooth 4.0 specification. Similar in many ways to Bluetooth Classic, there are some notable differences:

Power consumption is significantly lower, with BLE devices lasting months or years on a single battery.

- Bluetooth Low Energy uses lower data rates
- Simpler frequency hopping scheme
- Advertising functionality
- Fast connection times

This isn't an article on the finer points of Bluetooth, but the following terms will often be used when discussing Bluetooth Low Energy:

**Profile** – A profile is a pre-defined collection of services. Heart monitors for example, may provide the Heart Rate Profile which contains the Heart Rate Service and the Device Information Service.

**Service** – A service, specified by a UUID, contains multiple Characteristics (lists of pre-defined services can be found online). Developers are also free to create their own Services.

**Characteristics** – Defined by a UUID, characteristics are how data is transferred between devices. A Characteristic will contain data (or an array of data) about a specific “thing”. For example, the Heart Rate Measurement Characteristic will contain data regarding the heart rate value and is mandatory in the Heart Rate Service.

Due to these differences, Bluetooth Low Energy is more suited to embedded devices which do not require complex data transfer mechanism and where battery life is important. Bluetooth Low Energy has been seen in door locks, medical devices and iBeacons.


# iBeacon

iBeacon is a standard developed by Apple which uses small Bluetooth Low Energy devices to provide location data to mobile applications. Although developed by Apple, the iBeacon standard is supported cross platform and iBeacon applications exist on Android and iOS. iBeacon devices transmit a UUID at set intervals (set depending on requirements – the higher the transmit rate, the shorter the battery life). To take advantage of iBeacons, applications are written to listen for specific UUIDs and actions take place based on the UUID received. For example, a mobile application for a supermarket may show coupons and offers when it detects a specific UUID only present in specific locations. It is important to understand that iBeacons do not push notifications to devices; instead the application will deliver the notification to the user based on the UUID received.

iBeacons take advantage of Bluetooth Low Energy's advertisement mode, where the advertisement data follows a specific format.

<ibeacon prefix> <UUID> <Major #> <Minor #>

Although the UUID is unique per device (or should be...), the major and minor versions are used to identify a group of iBeacons, and identify an iBeacon with a group respectively.

![]({{ site.baseurl }}/assets/img/2015-04-01-iBeacon-and-Bluetooth-Low-Energy/1.jpg)

# Tools

The Ubertooth is perhaps the most well known tools for Bluetooth Low Energy testing (and may be covered in a future article), however more common tools and techniques exist for testing iBeacon devices.

## iBeaconDetector

iBeaconDetector is an Android application which will scan for Bluetooth Low Energy devices and highlight iBeacon devices.

![]({{ site.baseurl }}/assets/img/2015-04-01-iBeacon-and-Bluetooth-Low-Energy/2.png)

## BLE Scanner

BLE Scanner is a more general purpose Bluetooth low energy tool. With BLE Scanner it's possible to connect to a BLE device, query for supported GATTs and services and read/write data to them.

![]({{ site.baseurl }}/assets/img/2015-04-01-iBeacon-and-Bluetooth-Low-Energy/3.png)
![]({{ site.baseurl }}/assets/img/2015-04-01-iBeacon-and-Bluetooth-Low-Energy/4.png)

## LightBlue

Similar to BLE Scanner, but for iOS.

## Hcitool

hcitool (one of the Bluez Linux Bluetooth Stack utilities) can be used to generate iBeacon messages when using a bluetooth device capable of supporting Bluetooth Low Energy

To set advertising data:

```
hcitool -i hci0 cmd 0x08 0x0008 1E 02 01 1A 1A FF 4C 00 02 15 DE AD BE EF CA FE DE AD BE EF CA FE DE AD BE EF 00 00 00 00 C5 00
```

To start transmitting:

```
hciconfig hci0 leadv 
```

To stop transmitting:

```
hciconfig hci0 noleadv 
```

I will not provide a break down off the hcitool usage here (this can easily be found online), however the iBeacon data is set as follows:

```
DE AD BE EF CA FE DE AD BE EF CA FE DE AD BE EF | 00 00 | 00 00 | C5 00
UUID | major number | minor number | Transmit power
```

As well as tranmitting iBeacon data, hcitool can also be used to query scan for Bluetooth Low Energy devices.

```
hcitool lescan
LE Scan ...
1C:1A:C0:B1:B2:31 (unknown)
1C:1A:C0:B1:B2:31 (unknown)
CD:44:30:E9:23:30 (unknown)
CD:44:30:E9:23:30 jaalee
```

#### gatttool
Gatttool can be used to query and write to Bluetooth Low Energy devices. First, use hcidump to find the Address Type (Random or Public):

```
hcidump
<snip>
bdaddr CD:44:30:E9:23:30 (Random)
Shortened local name: 'jaalee............'
</snip>
```

Here we'll see gatttool in interactive mode:

```
sudo gatttool -b CD:44:30:E9:23:30 -I -t random
[ ][CD:44:30:E9:23:30][LE]> connect
[CON][CD:44:30:E9:23:30][LE]> char-read-uuid 2a24
[CON][CD:44:30:E9:23:30][LE]>
handle: 0x0010 value: 4a 41 41 4c 45 45 20 42 45 41 43 4f 4e
```

## HackRF
HackRF is a cheap Software Defined Radio capable of transmitting. Using open source BTLE software (https://github.com/JiaoXianjun/BTLE) it's possible to use this device to send BTLE packets. This can be done as follows:

```
sudo ./btle_tx 37-ADV_IND-TxAdd-1-RxAdd-0-AdvA-DEADBEEFCAFE-AdvData-020104 r100
```

This sends 100 packets with from the address DEADBEEFCAFE containing the data 020104.

# Attacks

As an iBeacon devices does not require pairing to read it's UUID, it may be possible to track individuals with a device broadcasting iBeacon traffic.

Spoofing a UUID is possible using a device capable of broadcasting iBeacon traffic. This includes, iOS devices, Android 5.0 and above and Linux Bluetooth 4.0 devices. Because of this, UUIDs should not be trusted to provide accurate proximity information for high risk scenarios.

There are known attacks on the Bluetooth Low Energy pairing mechanism (see any number of Bluetooth Low Energy security talks given by Mike Ryan, or his blog at https://lacklustre.net/).
