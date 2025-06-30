# API Gateway HTTPS Setup via Nginx Reverse Proxy (AWS EC2 + Cloudflare)

## Purpose

Securely serve your API Gateway over HTTPS using a free-tier EC2 instance running Nginx as a reverse proxy, with SSL from Let’s Encrypt, and DNS managed by Cloudflare.

---

## Prerequisites

- AWS account with Terraform-managed infrastructure
- Cloudflare DNS for your domain (nameservers set correctly)
- SSH access to EC2 (key pair)
- Your API Gateway is accessible from the Nginx EC2 instance

---

## Steps

### 1. **Create/Update DNS Record in Cloudflare**

- Go to Cloudflare DNS dashboard for your domain.
- Add an **A record**:
  - **Name:** `api-socialhub.omkard.site`
  - **Content:** `<EC2_PUBLIC_IP>`
  - **Proxy status:** DNS only
- Save and wait for DNS propagation (check with `nslookup` or [dnschecker.org](https://dnschecker.org)).

### 2. **Launch EC2 Instance for Nginx**

- Use Terraform to create a t2.micro EC2 instance (Ubuntu 22.04 recommended).
- Assign a public Elastic IP.
- Open ports 80 (HTTP) and 443 (HTTPS) in the security group.

### 3. **Install Nginx and Certbot**

SSH into the EC2 instance:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 4. **Configure Nginx as a Reverse Proxy**

Edit `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name api-socialhub.omkard.site;

    location / {
        proxy_pass http://13.219.243.151:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Replace `<API_GATEWAY_IP>` with your actual backend IP (private or public).
- Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. **Obtain SSL Certificate with Certbot**

```bash
sudo certbot --nginx -d api-socialhub.omkard.site
```

- Follow prompts for email and agreement.
- Certbot will automatically configure HTTPS in Nginx.
- Test: Visit `https://api-socialhub.omkard.site` in your browser.

### 6. **Update Frontend/API Clients**

- Update your frontend to use the new HTTPS API endpoint: `https://api-socialhub.omkard.site`

---

## Troubleshooting

- **DNS not resolving:** Double-check A record, wait for propagation, use `nslookup` and [dnschecker.org](https://dnschecker.org).
- **Certbot fails (DNS):** Make sure Cloudflare is your DNS provider and the A record is correct.
- **SSL errors:** Ensure ports 80/443 are open, and Nginx is running.
- **Mixed Content errors:** Make sure all frontend API URLs use `https://`.

---

## References

- [Let’s Encrypt Certbot Docs](https://certbot.eff.org/)
- [Cloudflare DNS Docs](https://developers.cloudflare.com/dns/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

---

**Keep this doc in `docs/api-https-setup.md` for future reference.**
