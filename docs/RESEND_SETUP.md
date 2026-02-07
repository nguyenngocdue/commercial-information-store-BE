# Hướng dẫn setup Resend để gửi Email

## 📧 Resend là gì?

[Resend](https://resend.com) là dịch vụ gửi email hiện đại dành cho developers, với API đơn giản và giá cả hợp lý:

- ✅ **Free plan**: 3,000 emails/tháng (đủ cho development)
- ✅ **API đơn giản**: Dễ dùng hơn nhiều so với SMTP
- ✅ **Deliverability cao**: Email không bị spam
- ✅ **Dashboard đẹp**: Theo dõi email realtime
- ✅ **React Email support**: Template email với React

## 🚀 Cách setup (5 phút)

### Bước 1: Đăng ký tài khoản

1. Truy cập: https://resend.com/signup
2. Đăng ký bằng email hoặc GitHub
3. Xác thực email

### Bước 2: Lấy API Key

1. Vào Dashboard: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Đặt tên: `Development` hoặc `Production`
4. Click **"Create"**
5. **Copy API key** (chỉ hiện 1 lần)

### Bước 3: Cấu hình `.env`

Mở file `/commercial-information-store-BE/.env` và thêm:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_123456789abcdefghijklmnopqrst
EMAIL_FROM=onboarding@resend.dev
```

**Lưu ý:**
- `RESEND_API_KEY`: Key vừa copy ở bước 2
- `EMAIL_FROM`: Dùng `onboarding@resend.dev` cho testing (miễn phí, không cần verify)
- Nếu muốn dùng email custom (vd: `support@360car.vn`), cần verify domain (bước 4)

### Bước 4: Test gửi email

1. Khởi động backend:
```bash
cd commercial-information-store-BE
pnpm dev
```

2. Vào frontend và thử "Quên mật khẩu":
```bash
cd commercial-information-store-FE
pnpm dev
```

3. Nhập email của bạn → Kiểm tra hộp thư đến

## 🎯 Verify Domain (Optional - cho Production)

Nếu muốn gửi từ email domain của bạn (vd: `support@360car.vn`):

### 1. Thêm domain

1. Vào: https://resend.com/domains
2. Click **"Add Domain"**
3. Nhập domain: `360car.vn`

### 2. Cấu hình DNS

Resend sẽ hiển thị 3 bản ghi DNS cần thêm:

```
Type    Name                        Value
SPF     @                           v=spf1 include:_spf.resend.com ~all
DKIM    resend._domainkey          (key sẽ được cung cấp)
DMARC   _dmarc                     v=DMARC1; p=none
```

Thêm vào DNS provider của bạn (Cloudflare, GoDaddy, Namecheap...)

### 3. Verify

- Đợi 5-10 phút để DNS propagate
- Click **"Verify"** trên Resend dashboard
- Khi verified, đổi `.env`:

```env
EMAIL_FROM=support@360car.vn
```

## 📊 Theo dõi Email

Vào Dashboard: https://resend.com/emails

Bạn sẽ thấy:
- ✅ Số email đã gửi
- ✉️ Email content (HTML preview)
- 📈 Delivery status (sent, delivered, opened, clicked)
- ⚠️ Errors (nếu có)

## 💰 Giá cả

| Plan | Emails/tháng | Giá |
|------|-------------|-----|
| **Free** | 3,000 | $0 |
| **Pro** | 50,000 | $20 |
| **Business** | 100,000 | $50 |

**Tip:** Free plan đủ dùng cho development và MVP!

## 🆚 So sánh với Gmail SMTP

| Feature | Resend | Gmail SMTP |
|---------|--------|------------|
| Setup | API key (5 phút) | App Password + 2FA (15 phút) |
| Free limit | 3,000/tháng | 500/ngày = ~15,000/tháng |
| Deliverability | Cao (99%) | Trung bình (70-80%) |
| Spam rate | Rất thấp | Cao (nếu gửi nhiều) |
| Dashboard | ✅ Có | ❌ Không |
| Support | ✅ Email + Docs | ❌ Community only |

## 🐛 Troubleshooting

### Email không được gửi

1. **Kiểm tra API key:**
```bash
echo $RESEND_API_KEY
```

2. **Kiểm tra logs trong terminal backend:**
```
⚠️ RESEND_API_KEY chưa setup - Development mode
📧 [DEV MODE] Email would be sent to: user@example.com
🔗 Reset URL: http://localhost:3000/reset-password?token=...
```

3. **Test API key bằng curl:**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your@email.com",
    "subject": "Test Email",
    "html": "<p>Hello World!</p>"
  }'
```

### Email vào Spam

- ✅ Verify domain (nếu dùng custom email)
- ✅ Thêm SPF, DKIM, DMARC records
- ✅ Tránh từ ngữ spam trong subject
- ✅ Bật warm-up mode (Resend dashboard)

## 📚 Tài liệu

- [Resend Docs](https://resend.com/docs)
- [Node.js SDK](https://resend.com/docs/send-with-nodejs)
- [Email Templates với React](https://resend.com/docs/send-with-react)
- [Domain Verification](https://resend.com/docs/dashboard/domains/introduction)

## 🎉 Hoàn tất!

Bây giờ hệ thống của bạn đã có thể:

1. ✅ Gửi email reset password
2. ✅ Email có design đẹp (HTML template)
3. ✅ Link có thời hạn 15 phút
4. ✅ Theo dõi delivery status
5. ✅ Free 3,000 emails/tháng

**Next steps:**
- Test chức năng forgot password
- Verify domain cho production
- Customize email template
- Setup webhook để track opens/clicks
