---
layout: post
title: DevSecOps and Android Development
tags: [Jenkins, Android, DevSecOps]
---

Let us ignore how spectacular DevSecOps (or one of its many alterations) is as a buzz word and look at what it can mean for secure application development. I strive to stay current with emerging security practices and techniques and since DevSecOps has been on the radar for Security Consultants and Developers alike, I thought it would be worth looking into how android application development could be improved by employing this methodology.

First a little background. DevSecOps arose from DevOps; an attempt to merge development and operations (IT) roles in software development and deployment. The reasoning behind this is simple; if software developers are in constant communication with IT (or Operations), there are less barriers in building, testing and releasing software. This allows development teams to release quickly and frequently and react to their customer’s needs.
 
To realise the model DevOps advocates, it is necessary to automate many aspects of what has previously been performed manually. In traditional application development, a development team would pass a finished application to IT who would then look into application deployment. This could mean building servers, dealing with connectivity, changing network layouts etc. As IT and developers merge to become one team it becomes possible to think about how code can be used to automate many of these processes. Cloud based services allow “Infrastructure as code” where servers can be created, configured and destroyed via web services. Tools such as Chef and Puppet allow configuration of multiple servers at the push of a button. Containers such as Docker allow applications to be packaged with their dependencies in a platform agnostic way and Continuous Integration tools such as Jenkins can perform automated testing and work as the glue that ties this all together.

DevSecOps simply attempts to add security into DevOp. By integrating and automating security testing, it becomes possible to perform security checks during every build or before every deployment. Although this is unlikely to uncover new or complex vulnerabilities, it would be possible to test against known issues either through static analysis, dynamic or run-time analysis, or configuration review. There is one major caveat, however. The tooling for this kind of automated security testing is currently very immature. The goal of this research is to attempt to integrate automated security testing into an Android application build process, using Drozer to perform the security tests. Drozer, an open source Android security assessment tool, was selected as its open source licence allows for modification and its modular approach allows security modules to be added to perform individual test. Jenkins was used to perform the build steps, deploy the built binary on an Android device and, finally, to run Drozer. As Drozer was not originally developed for this task, some modification was required in order to integrate it with Jenkins and a custom Jenkins module was written.

For this proof of concept, it was decided that Drozer would be used to test for two vulnerabilities during the build; the presence of the debug flag and SQL injection in an exported content provider.


Several techniques were considered to integrate Drozer with Jenkins:

- Using the Console Jenkins module to run Drozer by calling Drozer’s command line interface. 
- Writing a Jenkins module to wrap Drozer’s command line interface. 
- Adding a Java interface to Drozer. 

Of these three approaches, it was decided a Jenkins module would be written to manage the starting Drozer with appropriate command line arguments. Drozer was also modified to return the result of the security test i.e. whether the vulnerability was present in the final application.

With the current implementation of the Jenkins Drozer module, it should be configured with a list of modules that should be run against the Android application.

![]({{ site.baseurl }}/assets/img/2016-10-13-DevSecOps-and-Android-Development/2.png)

Within the application build steps, Jenkins can then be used to run the modules specified, with the correct arguments.

Two builds were performed, the first with the vulnerabilities present (build number 158) and the second after the vulnerabilities had been fixed (build number 159). As can be seen, the presence of the vulnerabilities were detected causing the build to fail.

![]({{ site.baseurl }}/assets/img/2016-10-13-DevSecOps-and-Android-Development/2.png)

Traditional security testing relies on bringing in security testing at the end of a project. Once the application is completed, a penetration test or security assessment is performed with the goal of producing a report listing all vulnerabilities found during the assessment. Although this approach can provide value, it is often expensive and can require extensive changes to the application after development ends. As we’ve seen in this research, it is possible to integrate security tools into the development lifecycle although a strong understanding of security is required by the development team. As DevOps aims to merge Development and Operations, DevSecOps should add security to this group. By working with security experts, tools and techniques can be developed which can aim to look for common vulnerabilities during each and every build. Even more powerful would be the ability to turn the output of a security assessment (i.e. the report) into usable, repeatable test cases. These could then be fed into further stages of development in an attempt to identify whether old vulnerabilities are reintroduced and new applications could benefit from rulesets created during previous projects.

Although tooling is currently immature, it can be seen that it is possible to take existing tools used by security experts and apply them to current development methodologies. It is unlikely this will replace manual testing, but should be used in conjunction with manual testing to aid in developing secure applications at lower cost.
 
This work was presented as a workshop at DevSecCon 2015.
