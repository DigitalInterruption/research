---
layout: post
title: Privilege Escalation in ManageEngine ADManager Plus 6.6
tags:
  - active directory
  - ADManager
  - CVE-2018-19374
image: /assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/changejre.png
---
During a recent review of the ADManager Plus software offered by Zoho, we were able to identify a privilege escalation vulnerability which would allow authenticated users to escalate to `NT AUTHORITY\SYSTEM` in versions up to and including 6.6 (build 6657).

### The Cause of the Vulnerability

After completing the installation, the software can be found in `C:\ManageEngine\ADManager Plus`, assuming the default location is not changed. Within this directory are several directories with weak security settings. The affected directories are:

- `bin`
- `lib`
- `tools`

The issue affecting these directories is that they are created with full control assigned to the `Authenticated Users` group:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/permissions.png)

The `Authenticated Users` group in Windows is not a typical group in which users can be added or removed. If an account authenticates with the system, be it a local account or domain account, it will be deemed to be part of the `Authenticated Users` group. The built-in accounts such as `LOCAL SERVICE` do not get included in this group, as they are accounts without a password that do not require  authentication.

By assigning full control to `Authenticated Users`, any user that is logged in is capable of modifying the contents of the aforementioned directories. The `bin` directory is of significance, as the entry point of the software is found in this directory, along with several other core executables.

An example of two files being accessed during startup can be seen in the screenshot of procmon below:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/bin_access.png)

As the nature of the software requires administrator privileges, due to it serving the purpose of managing an active directory environment, there is no reason to provide write access to all authenticated users. This misconfiguration is particularly dangerous due to the previously touched upon point - the software _requires_ administrator level access. The `ManageEngine ADManager Plus` service is by default installed to launch using the local system account:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/sc.png)

### Exploitation

To exploit this vulnerability, one of the core files used by ADManager in the `bin` directory needs to be modified or replaced to execute a payload that will elevate one's privileges. As previously mentioned, one must be in the context of an authenticated user, in this example, we will start as a low privilege user aptly named `lowpriv`:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/lowpriv-shell.png)

It was previously noted that when the service starts, the `wrapper.exe` and `admanager.exe` files are both accessed. Whilst it is possible to backdoor these files, they cannot be overwritten whilst the service is running. Instead, an alternative file must be found which either:

- Is not persistently running after startup
- Can be modified whilst being executed

Running procmon again and looking at the results show several other files being accessed during startup - in particular, `ChangeJRE.bat`. As this is a batch script, even if this script continues to execute throughout the lifetime of the process, it can still be modified in place.

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/changejre.png)

The purpose of this file appears to be to upgrade several files if newer versions are present. For example, if a file is present in `lib/native` named `ntlmauth.dll_new`, the `ntlmauth.dll` file will be deleted and replaced with `ntlmauth.dll_new`. Although this mechanism can be abused, it would mean creating a DLL that is compatible with the previous one; there is much simpler way to utilise this file.

By adding an extra line to the batch file, we can make it run another executable. Rather than just launching the executable directly, it should ideally be launched using `start`. This will make the executable launch in a non-blocking manner and allow `ChangeJRE.bat` to continue executing seamlessly:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/changejre-modification.png)

The highlighted change in the above screenshot will launch `C:\ManageEngine\ADManager Plus\bin\privesc.exe` alongside `ChangeJRE.bat`. In this case, we created `privesc.exe` using `msfvenom`:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/msfvenom.png)

With a payload ready and the backdoored batch file, all that is left to do is upload them and wait:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/upload.png)

After initiating a reboot on the server, the previous session (running as `lowpriv`) drops, and a new session is initiated as the server comes back up; this time running as `NT AUTHORITY\SYSTEM`:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/privesc.png)

Looking at the task list after acquiring the SYSTEM shell also confirms that the modification made to `ChangeJRE.bat` is not blocking execution; meaning that ADManager Plus will continue to function as normal:

![]({{ site.baseurl }}/assets/img/2019-04-15-privilege-escalation-in-manageengine-admanager-plus-6/tasklist.png)

### Timeline
- **2018-11-15**: Vulnerability identified in build 6653
- **2019-01-31**: Vendor contacted via their bug bounty program
- **2019-01-31**: Acknowledgement from vendor and investigation opened
- **2019-04-15**: Vulnerability confirmed to be in the latest build (6657)
- **2019-02-28**: Update released to fix vulnerability
- **2019-04-15**: Public disclosure
