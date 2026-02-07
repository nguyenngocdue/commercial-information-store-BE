# 📱 Hướng dẫn Setup ESMS.VN

## 🎯 Test ngay - MIỄN PHÍ!

**Không cần đăng ký ESMS**, đã có sẵn test phone numbers:

```bash
# Test với các số sau (FAKE OTP - FREE):
0999999999 → OTP: 123456
0888888888 → OTP: 111111
0777777777 → OTP: 222222
0339001600 → OTP: 999999
```

Vào `/forgot-password`, nhập số test → Nhận OTP cố định → Không tốn tiền! 🎉

---

## 🚀 Setup ESMS.VN cho số thật (5 phút)

### Bước 1: Đăng ký tài khoản
1. Truy cập: https://esms.vn/register
2. Điền thông tin: Email, SĐT, Mật khẩu
3. Xác thực email

### Bước 2: Xác thực tài khoản
1. Đăng nhập: https://esms.vn/login
2. Vào **Hồ sơ** → Upload CMND/CCCD
3. Chờ duyệt (15-30 phút)

### Bước 3: Nạp tiền
1. Vào **Nạp tiền**
2. Chọn mức: 100,000đ (được ~150 SMS)
3. Chuyển khoản qua:
   - Banking/Momo/ZaloPay
   - Hoặc thẻ cào điện thoại

### Bước 4: Lấy API Key
1. Vào **Dashboard** → **API Settings**
2. Copy:
   - **API Key**: `xxxxxxxxxxxxxxx`
   - **Secret Key**: `xxxxxxxxxxxxxxx`

### Bước 5: Cấu hình .env
```env
# Thêm vào file .env
ESMS_API_KEY=your_api_key_here
ESMS_SECRET_KEY=your_secret_key_here
ESMS_BRANDNAME=BAOTRI
```

### Bước 6: Restart server
```bash
# Ctrl+C để stop, sau đó:
pnpm start:dev
```

---

## 🧪 Test thử

### Test với số FAKE (FREE):
```bash
# Forgot password với: 0999999999
# Nhập OTP: 123456
# ✅ Thành công! Không tốn tiền
```

### Test với số thật (Tốn ~700đ):
```bash
# Forgot password với: 0912345678 (số của bạn)
# Nhận SMS thật qua đầu số BAOTRI
# Nhập OTP từ tin nhắn
# ✅ Thành công! Chi phí: ~700đ
```

---

## 💰 Bảng giá ESMS.VN

| Loại tin nhắn | Giá/SMS | Ghi chú |
|---------------|---------|---------|
| Brandname OTP | 600-700đ | Khuyến nghị |
| Số cố định | 500-600đ | Chậm hơn |
| Số ngẫu nhiên | 450-550đ | Có thể bị chặn |

---

## 🎭 Thêm số test của bạn

Muốn thêm số test miễn phí? Sửa file `sms.service.ts`:

```typescript
private readonly TEST_PHONES: Record<string, string> = {
  '0999999999': '123456',
  '0888888888': '111111',
  '0777777777': '222222',
  '0339001600': '999999',
  '0912345678': '555555',  // ← Thêm số của bạn
  '0987654321': '666666',  // ← Và OTP tùy chỉnh
};
```

---

## 📊 Response Codes của ESMS.VN

| Code | Ý nghĩa | Giải pháp |
|------|---------|-----------|
| `100` | Thành công | ✅ |
| `101` | API Key sai | Kiểm tra lại .env |
| `102` | Secret Key sai | Kiểm tra lại .env |
| `103` | Brandname chưa đăng ký | Đổi ESMS_BRANDNAME |
| `104` | Hết tiền | Nạp thêm tiền |
| `105` | Số điện thoại không hợp lệ | Kiểm tra format |

---

## 🆘 Hỗ trợ

- **Hotline**: 1900 2132
- **Email**: hotro@esms.vn
- **Zalo**: 0911223344

---

## ✅ Checklist

- [ ] Đã test với số FAKE (0999999999)
- [ ] Đã đăng ký ESMS.VN
- [ ] Đã xác thực tài khoản
- [ ] Đã nạp tiền
- [ ] Đã lấy API Key
- [ ] Đã cấu hình .env
- [ ] Đã restart server
- [ ] Đã test với số thật

---

**💡 Tip**: Dùng số test (0999999999) để develop, chỉ dùng số thật khi deploy production!
