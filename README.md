# jpdev

## About

Personal and professional website

## Maintenance

This website is deployed on the Amazon Web Services Lightsail platform and has the public IP address `52.33.172.164`.

Here are the steps to revise the website, assuming that you have the current repository locally:

- Make revisions to your local `jpdev` repository
- Commit the revisions:
  - `git add .`
  - `git commit -m "revise …`
- Track the revisions on GitHub: `git push`
- Connect to the server: `ssh bitnami@jpdev.pro`
- Navigate to the deployed repository: `cd /opt/bitnami/apache2/htdocs/jpdev`
- Update the deployed repository with the revisions: `git pull`

Without further action, the revised website is now served.

## Domain name

The domain name `jpdev.pro` is registered with Porkbun.

## DNS

The DNS configuration for the `jpdev.pro` website at Porkbunis:

```csv
DOMAIN,HOST,TYPE,ANSWER,TTL,PRIO
jpdev.pro,jpdev.pro,A,52.33.172.164,600,0
jpdev.pro,zb15225388.jpdev.pro,CNAME,zmverify.zoho.com.,600,0
jpdev.pro,www.jpdev.pro,CNAME,jpdev.pro,600,0
jpdev.pro,s2._domainkey.jpdev.pro,CNAME,s2.domainkey.u20844107.wl108.sendgrid.net.,600,0
jpdev.pro,s1._domainkey.jpdev.pro,CNAME,s1.domainkey.u20844107.wl108.sendgrid.net.,600,0
jpdev.pro,jpdev.pro,MX,mx.zoho.com.,600,10
jpdev.pro,jpdev.pro,MX,mx2.zoho.com.,600,20
jpdev.pro,jpdev.pro,MX,mx3.zoho.com.,600,30
jpdev.pro,pool._domainkey.jpdev.pro,TXT,"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY5X7AsuyrxgGppSTmt6OOpoDfnRyEBQt84RXyaA9ns66sl5HQ+PfbpbcFltqUp4J+ASI41fZTU5fKsNXey639DA0Nyss2D14ycG9WvvNDwTOKslMx3ekT3SbsuCbED53jGhUZRSGmFQSd0X2M9anrOSk3XTTkrALjjnZO2wkUXQIDAQAB",600,0
jpdev.pro,jpdev.pro,TXT,"v=spf1 include:zoho.com include:u20844107.wl108.sendgrid.net ~all",600,0
jpdev.pro,jpdev.pro,TXT,"v=DMARC1; p=none; pct=100; rua=mailto:pool@jpdev.pro",600,0
jpdev.pro,zoho._domainkey.jpdev.pro,TXT,"k=rsa; t=y; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIBDjl+rOZFr6d+iLOmGHn1Hb2XQ9bUQJ/pEaoXwmW+pj0wVil4S0h8KII5PZ9N93+XeBmWYV5KlrT2tAiFC36n0qBW9YYFcKiCRO/bQf/dg7G3zvX8cR1Q/DNojHQiqsnaiAxU2zHNBtL4A4Gu72hyS0bjHcmG5XFN0n/O410IQIDAQAB",600,0
```
