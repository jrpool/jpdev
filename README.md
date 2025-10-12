# jpdev

## About

Personal and professional website

## Maintenance

This website is deployed on the Amazon Web Services Lightsail platform.

Here are the steps to revise the website, assuming that you have the current repository locally:
- Make revisions to your local `jpdev` repository
- Commit the revisions:
    - `git add .`
    - `git commit -m "revise …`
- Track the revisions on GitHub: `git push`
- Connect to the server: `ssh bitnami@jpdev.pro`
- Navigate to the deployed repository: `cd /opt/bitnami/apache2/htdocs`
- Update the deployed repository with the revisions: `git pull`

Without further action, the revised website is now served.
