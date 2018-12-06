---
layout: post
title: Improving WordPress Security
tags: [WordPress, security, web application]
---
WordPress is one of the most popular Content Management Systems and is a favourite choice for SMEs. It allows websites to be built that look good, perform well and are cheap to develop. Because of its success, it also a popular target for malicious attackers. A question we hear a lot at Digital Interruption is "Why did I get attacked? My site isn't interesting". What we often see is that an attacker rarely will choose a target based on the content of the site. Often the Internet is scanned for easy to hack WordPress installations. If you are part of that list, expect to be hit.

We wrote this article to help small companies with limited budget understand the best ways they can secure their WordPress applications and reduce the risk of being attacked.

## Account Security
### Passwords
Attackers will often try to brute-force passwords for high privileged accounts (such as the "admin" account) so it's important to make sure strong passwords are in use. There are a number of password recommendations, however we suggest one of the following:

- A minimum four word passphrase based on diceware
- A random (minimum 8) character string consisting of random characters

We recommend diceware passphrases when a password needs to be easy to remember. The classic example is "correct horse battery staple" - four random words that are easy to remember (although do not use this password!). The strength in diceware passphrases comes only if the words are truly random so a phrase such as "the hills are alive with the sound of music" would not be considered secure.

Where a random character password is used, make use of a password manager to store the password. This way, it doesn't need to be remembered by humans.

### Usernames
There are a number of things that should be done to decrease the chance of an attacker brute-forcing an account password. As well as a strong password, a new admin account should be created with a username that is not known to an attacker. This username should be kept secret and only used to login. The display name should be different from the username.

Although it may be possible for an attacker to somehow guess or figure out this account name, it will stop the majority of automated scripts and bots.

### Two Factor Authentication
In addition to a username and password, we recommend two factor authentication is used to help keep hackers out of accounts. With two factor authentication enabled (2FA), additional proof of account ownership is required such as access to a specific phone number or device. Should an attacker gain access to the account username and password, unless they also have access to the second device, they will not be able to log into the account.

We recommend [Google Authenticator](https://en-gb.wordpress.org/plugins/google-authenticator/) for 2FA.

### Managing Plugins
#### Limit number of Installed Plugins
WordPress is powerful because it can be modified by the use of plugins and themes. Although this makes the creation of a custom web application fairly simple, with each new plugin installed there is a risk a security vulnerability will be introduced onto the website. Because of this, the number of plugins installed should be limited to those that are needed. Where possible, the following should be asked when choosing a plugin or theme:

- Is the plugin in the official WordPress plugin store?
- Is the plugin/theme developed by a team?
- Is it a mature project (been in use for a long time)?
- Is there a "pro" or paid for version?
- Are updates regularly issued?

The more of these that can be answered "yes" to, the more trusted a plugin is likely to be.

#### Update Plugins
Many attackers will try and identify WordPress installations with known vulnerable plugins, so it's important to keep plugins up to date. If a vulnerability is found and fixed in a plugin, by not updating regularly, you risk being picked up by the automated tools used by many hackers.

### Install Security Plugins
There are many security plugins that should be installed to provide additional security monitoring and protections for your site. Many of these plugins perform the following:

- IP Blocking
- Security scanning
- WordPress Firewall
- Monitoring
- Source code integrity checking

Some popular plugins include; Wordfence, IThemes Security and Securi Security.

### Backup
Regular backups can be helpful for when a site does become compromised. If a backup is performed correctly, recovering from an attack could be as simple as restoring from a known good copy of the site, limiting any downtime and reputational damage you may suffer from a hacked site.

Some WordPress hosting companies provide backups, or backups can be performed manually if hosting on a VPS. Many plugins are also available to automate the backup process including BackupBuddy (paid) and BackWPUp (free). It is recommended that backups are copied and stored offline so the backups are safe if the backup server is compromised.

### TLS
TLS (aka HTTPS) is an updated version of SSL and is used to encrypt and protect traffic between a website and its users. This will stop attackers from easily viewing passwords and other sensitive information as it passes over a network.

To enable TLS first check your hosting provider. Many will setup WordPress with a certificate during the WordPress installation and many will offer a free certificate from Let's Encrypt.

Alternatively, TLS can be configured manually in WordPress or with one of many WordPress plugins.

### Configuration
A misconfiguration in WordPress may allow an attacker to take over a site or perform actions that could have reputational damage to your company. Below is a quick checklist of configuration actions that should be performed:

- Users and comments require approval
- Remove WordPress registration page
- Delete `readme.html`, `licence.txt`, `wp-config.php` and `wp-admin/install.php` files
- Use `.htaccess` to restrict access to `wp-admin` to whitelisted IP addresses

### Third Party Testing
For complex or high risk sites where security is a priority, a manual security test should be performed. This is where a security expert will simulate a malicious attacker and attempt to breach your application, giving you an understanding of what a targeted attacker could do. Two types of reviews can be performed based on your budget, length of testing time and what type of assurance you require. In brief, a blackbox penetration test (where only public information is given to the security expert) can be cheaper but may take more time whereas a whitebox test (where source code, server access etc. is given to the security expert) may be more expensive but can be done in less time.

A good security tester will provide a list of recommendations on how to fix any vulnerabilities they find. This list will be rated based on severity of the issue and so issues should be prioritised and fixed as soon as possible. In order to make the best use of the security experts time, we recommend that easy to address security issues are found and fixed before the test begins. This means all testing time can focus on issues that cannot be discovered using automated scanning tools.
