# Tử Vi Phát Đạt — BEAR DEV

Đền Tử Vi & Gieo Quẻ Kinh Dịch 2.5D cho TikTok LIVE. Người xem bình luận hoặc theo dõi là bước vào đền, ngồi trên thảm đỏ chờ tới lượt tiến lên chiếu trước mặt **Ông Đồ** xin quẻ. Quà tặng được tính bằng **Kim Cương (KC)** (1 KC = 1 xu) và quy ra **5 Mốc Gieo Quẻ** theo chủ đề (*Tình Duyên, Tài Lộc, Sự Nghiệp, Gia Đạo, Sức Khỏe, Vận Mệnh*). Đền có vòng **Bát Quái & 12 Con Giáp** xoay phát sáng, Ông Đồ 4 tư thế (vuốt râu, lắc ống xâm, tung 3 đồng xu cổ Càn Long Thông Bảo trên mâm đồng, mở cuộn chiếu chỉ đọc lời phán), bảng **Quẻ Kinh Dịch Lục Hào**, giọng đọc Ông Đồ luận giải và bảng **Top Công Đức** cập nhật liên tục.

Đây là dự án do **BEAR DEV** phát triển và duy trì, phát triển trên nền kiến trúc TikTok LIVE 2.5D cùng hệ sinh thái với [Chánh Điện Tịnh Tâm · Bear](https://github.com/khanhdevngu/chanh-dien-online-bear) và [City Beer Station — BEAR DEV](https://github.com/khanhdevngu/dinhauonline). Dự án giữ giấy phép MIT và ghi nhận đầy đủ bản quyền mã nguồn.

| Thư mục | Là gì |
|---|---|
| `index.html`, `assets/` | Bản web tĩnh để mọi người tự vào đền ngồi chiếu, bấm gieo quẻ và nghe luận giải tại chỗ |
| `live/` | Bộ phát LIVE: server Node, overlay 9:16 (`1080×1920`), bảng điều khiển Streamer |

## Chạy nhanh trên Windows

Nhấp đúp `run.bat` ở thư mục gốc. File sẽ:

1. Kiểm tra Node.js; nếu chưa có hoặc cũ hơn 22.19 thì hỏi có muốn tự cài/nâng cấp Node.js LTS bằng `winget` không.
2. Tự cài dependency cho `live/` nếu thiếu (chạy `run.bat --reinstall` để cài lại).
3. Mở server LIVE tại `http://localhost:3000` (bỏ qua nếu cổng đã có server chạy sẵn).
4. Mở web demo tĩnh tại `http://localhost:4173`.
5. Chờ server sẵn sàng rồi tự mở web demo và bảng điều khiển `http://localhost:3000/live/control.html`.

Đóng hai cửa sổ server để dừng ứng dụng.

## Chạy bộ LIVE

Cần Node.js 22.19 trở lên (thư viện `piratetok-live-js` yêu cầu).

```bash
cd live
npm install
npm start
```

1. Mở `http://localhost:3000/live/control.html` (bảng điều khiển).
2. Bấm **Mở màn hình overlay 9:16** (hoặc thêm trực tiếp link `http://localhost:3000/live/overlay.html` vào TikTok LIVE Studio / OBS). Âm thanh trên overlay sẽ tự động kích hoạt, không hiện nút chắn màn hình.
3. Trong TikTok LIVE Studio: dùng *Link / Browser source* trỏ tới `http://localhost:3000/live/overlay.html` (hoặc *Window capture* cửa sổ overlay). Với OBS: *Browser source* trỏ tới `http://localhost:3000/live/overlay.html`, kích thước `1080×1920`.
4. Bật LIVE trên TikTok, nhập `@username` vào bảng điều khiển, bấm **Kết nối**.

Đổi cổng bằng biến môi trường, ví dụ `PORT=3100 npm start` (Windows PowerShell: `$env:PORT=3100; npm start`).

Chưa live vẫn thử được: dùng **Thử tương tác**, **5 nút Gieo Quẻ theo mốc**, **Đổ người mẫu 12/24/36/48/64**, **Làm trống đền** hoặc **Bot mô phỏng**.

## Luật chơi & Cách xin quẻ

- **Theo dõi hoặc bình luận bất kỳ** → bước vào đền, ngồi vào chiếu chờ trên thảm đỏ. Khi tới lượt gieo quẻ, tín chủ sẽ tiến lên **Chiếu Luận Quẻ trung tâm** ngay trước mâm đồng của Ông Đồ. Sức chứa tự mở `24 → 36 → 48 → 64`.
- **Bình luận theo cú pháp `MỐC QUẺ + CHỦ ĐỀ`** (ví dụ: `KHAI LỘC TÌNH DUYÊN`, `PHÚC LỘC TÀI LỘC`, `THIÊN MỆNH SỰ NGHIỆP`, hoặc bình luận có từ `xin quẻ`, `gieo quẻ`, `tử vi`, `tình duyên`, `tài lộc`, `gia đạo`...) → được đưa vào **Hàng Chờ Gieo Quẻ** và Ông Đồ tự động gieo quẻ, đọc lời phán cho tín chủ.
- **Hoa hồng** (và "Rose") → dâng 1 lễ hương hoa (+1 KC công đức), Ông Đồ cảm tạ và gieo quẻ ngắn đầu xuân.
- **Tặng quà theo mốc KC** → cộng KC vào bảng **Top Công Đức** và lập tức kích hoạt nghi thức **Gieo Quẻ Kinh Dịch** tương ứng với giá trị quà.
- **Cỏ bốn lá (`Lắc Ống Xâm May Mắn`)** → Ông Đồ lắc ống xâm tre, rút thẻ xâm bất ngờ:

  | Kết quả | Điều kiện | Thưởng Công Đức |
  |---|---|---|
  | ĐẠI CÁT ĐẠI LỢI! | 3 đồng xu cùng mặt | +30 KC |
  | THƯỢNG THƯỢNG QUẺ | tổng điểm 15–18 | +20 KC |
  | CÁT TƯỜNG NHƯ Ý | tổng điểm 9–14 | +10 KC |
  | BÌNH AN VÔ SỰ | tổng điểm 3–8 | +5 KC |

  Kèm một lời khuyên tu tâm hành thiện từ Ông Đồ.
- **Bình luận `xin quẻ` / `gieo quẻ` / `lắc xâm` / `cầu lộc`** → toàn bộ tín chủ trong đền chắp tay vái lễ, hoa sen và đồng xu cổ bay rợp đền.
- **Thả tim** → hoa sen hồng bay lên trên đầu nhân vật.
- **Top Công Đức** hiện 5 tín chủ gieo duyên nhiều nhất.
- Định kỳ mỗi 3 phút Ông Đồ tự động gieo một quẻ chung chúc phúc cho toàn bộ khán giả trong phòng LIVE (đổi được trong bảng điều khiển).

## 5 Mốc Gieo Quẻ & 6 Chủ Đề Luận Giải

Giá trị quà tính bằng **KC** (1 KC = 1 coin/diamond). Mỗi lần tặng quà hoặc bình luận xin quẻ, hệ thống đối chiếu theo bảng **5 Mốc Gieo Quẻ**:

| Mốc Quẻ | Định mức KC | Thời lượng | Nội dung luận giải |
|---|---|---|---|
| 🪙 **Khai Lộc** | 10–29 KC | 18s | Luận nhanh việc bạn hỏi nên hay chưa nên, điểm cát hung chính |
| 📜 **Phúc Lộc** | 30–69 KC | 25s | Phân tích theo hình tượng quẻ Kinh Dịch, hào động và lời khuyên |
| ☯️ **Thiên Lộc** | 70–149 KC | 35s | Luận sâu vận hạn, thời điểm thuận lợi và quý nhân phù trợ |
| 🐉 **Long Phượng** | 150–298 KC | 48s | Luận chi tiết cung mệnh, hướng hợp, màu sắc và hóa giải xung khắc |
| 👑 **Thiên Mệnh** | 299+ KC | 65s | Đại quẻ toàn diện: thiên thời, địa lợi, nhân hòa, đại vận cả năm |

### 6 Chủ Đề Xin Quẻ

| Chủ đề | Từ khóa bình luận nhận diện tự động |
|---|---|
| 💕 **Tình Duyên** | `tình duyên`, `tình cảm`, `người yêu`, `hôn nhân`, `duyên` |
| 💰 **Tài Lộc** | `tài lộc`, `tiền bạc`, `kinh doanh`, `buôn bán`, `lộc` |
| 🏛️ **Sự Nghiệp** | `sự nghiệp`, `công danh`, `công việc`, `thi cử`, `thăng tiến` |
| 🏡 **Gia Đạo** | `gia đạo`, `gia đình`, `con cái`, `nhà cửa`, `bình an` |
| 🌿 **Sức Khỏe** | `sức khỏe`, `bệnh tật`, `thân tâm`, `an khang` |
| ☯️ **Vận Mệnh** | `vận mệnh`, `vận hạn`, `năm nay`, `tử vi`, `bản mệnh` |

## Hệ Thống Quẻ Kinh Dịch Lục Hào

Mỗi lần gieo quẻ, Ông Đồ thực hiện đầy đủ 4 bước trên màn hình:
1. **Lắc Ống Xâm (`shake`)**: Ông Đồ cầm ống xâm Bát Quái lắc đều, tiếng thẻ tre va nhau lách cách.
2. **Tung Đồng Xu Cổ (`cast`)**: 3 đồng xu cổ **Càn Long Thông Bảo** bay lên và nảy trên **Mâm Đồng Gieo Quẻ** trước mặt Ông Đồ, ngẫu nhiên lật mặt Âm/Dương.
3. **Lập Quẻ Lục Hào**: Bảng **Quẻ Kinh Dịch** bên phải hiển thị trực quan 6 hào (Hào Dương liền nét, Hào Âm đứt nét), chấm đỏ đánh dấu **Hào Động**, tên quẻ chính (ví dụ: *Thuần Càn, Địa Thiên Thái, Hỏa Thiên Đại Hữu, Sơn Hỏa Bí, Thủy Hỏa Ký Tế, Phong Hỏa Gia Nhân, Trạch Thiên Quải, Lôi Địa Dự*) và **Quẻ Biến**.
4. **Khai Chỉ Đọc Quẻ (`read`)**: Ông Đồ mở cuộn chiếu chỉ vàng, bảng **Ông Đồ Nhắn Gửi** hiện lời luận giải theo đúng **Tín chủ · Mốc Quẻ · Chủ Đề** và phát giọng đọc tiếng Việt.

## Đổi nhân vật

Các tín chủ được chia thành 4 nhóm. Bình luận đúng từ khóa của nhóm sẽ lọc trong nhóm đó rồi chọn nhân vật tương ứng:

| Từ khóa chat | Nhóm | Nhân vật trong nhóm |
|---|---|---|
| `nam` (cũng `anh`, `trai`) | Nam | nam áo dài/lịch sự, nam mũ lưỡi trai |
| `nữ` (cũng `chị`, `gái`, `em`, `bé`) | Nữ | nữ áo dài truyền thống, nữ thanh lịch |
| `ông già` (cũng `chú`, `bác`, `cụ`) | Ông già | cụ ông áo gấm |
| `bà già` (cũng `bà`, `má`, `cụ bà`) | Bà già | cụ bà áo nâu |

Từ khóa riêng theo dáng vẫn dùng được: `mũ` → mũ lưỡi trai, `sexy` → nữ thanh lịch.

## Ngày và đêm

Không gian đền đổi cảnh theo giờ của máy phát: khoảng **05:00–16:00 Ban ngày (`Giờ Dương — Khai Quẻ Đón Lộc`)** (nền `tuvi-bg-light.webp`, nắng sớm chiếu qua khung cửa gỗ), **16:00–05:00 Ban đêm (`Giờ Âm — Luận Quẻ Đêm Khuya`)** (nền `tuvi-bg-dark.webp`, đèn lồng đỏ và nến lung linh). Hai nền chuyển mờ dần tự nhiên theo thời gian.

Bảng điều khiển có mục **Thời điểm trong đền**: `Tự động theo giờ`, `Luôn ban ngày`, `Luôn ban đêm`, cùng hai ô giờ tuỳ chỉnh.

## Bảng điều khiển (`live/control.html`)

- Kết nối / ngắt TikTok LIVE theo `@username`; không cần mật khẩu hay cookie.
- Xem số tín chủ trong đền, tổng KC công đức, danh sách hàng chờ gieo quẻ và số KC từng người; xoá người mẫu/bot.
- Chọn nhanh **Chủ đề xin quẻ** (*Tình Duyên, Tài Lộc, Sự Nghiệp, Gia Đạo, Sức Khỏe, Vận Mệnh*) và bấm **5 nút Mốc Quẻ** (*Khai Lộc +15 KC, Phúc Lộc +45 KC, Thiên Lộc +99 KC, Long Phượng +199 KC, Thiên Mệnh +299 KC*) hoặc **Lắc Ống Xâm**.
- Bốn nút **Đổi nhân vật (nhóm)** gửi bình luận `nam` / `nữ` / `ông già` / `bà già` để đổi dáng tín chủ.
- Đổ người mẫu, làm trống đền, bật/tắt bot mô phỏng (chỉ chạy trên máy bạn).
- Chọn giọng đọc (Edge Nam Minh / Hoài My hoặc Google tiếng Việt), độ trầm, tốc độ; đọc thử câu khấn.
- Bật/tắt nhạc cổ phong, tiếng đền & chuông mõ, tiếng gieo xu, tự động gieo quẻ định kỳ; chọn bài, âm lượng, số chiếu ngồi.
- Đổi bảng hiệu đền (mặc định `Tử Vi Phát Đạt`), dòng phụ và bật/tắt tự xếp chiếu cho người theo dõi.

## Giọng đọc Ông Đồ

Hỗ trợ giọng đọc tiếng Việt truyền cảm (Edge Neural TTS `vi-VN-NamMinhNeural` trầm ấm hợp vai Ông Đồ, `vi-VN-HoaiMyNeural`, hoặc Google TTS tốc độ cao). Server tự chia câu dài thành từng đoạn ngắn, thử lại trên kết nối mới và tự động chuyển dự phòng sang Google TTS nếu mạng chặn Edge WebSocket. Các câu đã đọc được lưu đệm trong bộ nhớ để phản hồi tức thì.

## Nhạc cổ phong & Âm thanh Đền Tử Vi

Nhạc nền đọc từ [`assets/music/library.json`](assets/music/library.json) qua trình phát dùng chung [`assets/audio-player.js`](assets/audio-player.js).

Mặc định là **Nhạc Cổ Phong · Đàn Tranh & Sáo Trúc** — tổng hợp trực tiếp bằng Web Audio API trong [`assets/bar-sound.js`](assets/bar-sound.js) theo âm giai ngũ cung Á Đông, kết hợp tiếng chuông chùa ngân, tiếng mõ gỗ đều nhịp và tiếng đồng xu cổ rơi trên mâm đồng. Không cần file nhạc rời và hoàn toàn không vướng bản quyền:

```json
{
  "id": "house-band",
  "title": "Nhạc Cổ Phong · Đàn Tranh & Sáo Trúc",
  "engine": "band",
  "credit": "Tổng hợp Web Audio cổ phong (BEAR)",
  "license": "Tài nguyên của dự án"
}
```

Bạn vẫn có thể thêm file `.mp3`, `.ogg`, `.m4a`, `.wav` vào `assets/music/` và khai báo trong `library.json` nếu muốn phát nhạc riêng.

## Đồ hoạ & Công cụ đóng gói Sprite Atlas

- Hai nền đền `1080×1920`: `assets/tuvi-bg-dark.webp` (đêm đèn lồng đỏ) và `assets/tuvi-bg-light.webp` (ngày nắng sớm).
- Bộ 16 sprite chất lượng cao đóng gói thành `assets/atlas.webp` + `assets/atlas.json`:
  - **Ông Đồ (4 tư thế)**: `master_idle` (vuốt râu), `master_shake` (lắc ống xâm), `master_cast` (gieo đồng xu), `master_read` (đọc chiếu chỉ).
  - **Tín chủ ngồi quỳ lễ trên chiếu (6 nhân vật)**: `guest_man`, `guest_woman`, `guest_uncle`, `guest_oldwoman`, `guest_cap`, `guest_sexy`.
  - **Tín chủ đi bộ tiến vào đền (6 nhân vật)**: `walk_man`, `walk_woman`, `walk_uncle`, `walk_oldwoman`, `walk_cap`, `walk_sexy`.
- Vòng Bát Quái & 12 Con Giáp, Mâm Đồng Gieo Quẻ 3D, đồng xu Càn Long Thông Bảo lật mặt Âm/Dương, thẻ xâm, kim nguyên bảo và hoa sen được vẽ trực tiếp trên Canvas trong [`assets/scene.js`](assets/scene.js) và [`assets/beer-fx.js`](assets/beer-fx.js).

Tạo lại sprite và đóng gói lại atlas từ ảnh gốc trong `vibe_images/`:

```bash
cd live
npm run assets:key
npm run assets:atlas
```

## Bảo mật

- **Không dùng tài khoản TikTok.** Server chỉ đọc sự kiện công khai của phòng live theo username. Không hỏi, không lưu mật khẩu, cookie hay session; không gửi tin nhắn thay bạn.
- **Chỉ mở trên máy mình.** Server lắng nghe `127.0.0.1`; máy khác trong mạng hay Internet không truy cập được. Muốn mở ra ngoài phải tự đặt `HOST` và nên thêm đăng nhập trước.
- **Chặn trang web lạ điều khiển.** WebSocket chỉ nhận kết nối từ chính trang của server (kiểm tra `Origin`), header `Host` phải là localhost (chống DNS rebinding). Overlay chỉ nhận dữ liệu, không gửi lệnh.
- **File tĩnh có danh sách trắng.** Chỉ phục vụ `/index.html`, `/assets` và `/live`; chặn file ẩn, `node_modules`, mã server, `package.json` và mọi đường dẫn `../`.
- **Không tin dữ liệu vào.** Tên, bình luận, tên quà bị cắt độ dài; cài đặt chỉ nhận đúng khóa, đúng kiểu, trong giới hạn; chữ đưa vào giọng đọc được escape XML; mọi chữ trên màn hình vẽ bằng `textContent` hoặc canvas.
- **Chống spam.** Hàng đợi giọng đọc tối đa 15 câu; bình luận thường không đọc thành tiếng trừ khi khớp cú pháp xin quẻ.
- **Avatar được đệm tại máy phát.** Server chỉ tải avatar qua https từ host TikTok CDN trong danh sách trắng, kiểm tra lại redirect, giới hạn 3 MB, thu nhỏ 160 px WebP, lưu trong `live/avatar-cache/` (tự xoá bớt khi quá 400 ảnh).

## Lưu ý

- `piratetok-live-js` là thư viện cộng đồng, không phải API chính thức của TikTok. Nó tự ký WebSocket trên máy phát nên không cần signing server hay API key, nhưng có thể ngừng chạy khi TikTok đổi hệ thống. Kiểm tra điều khoản TikTok trước khi dùng cho kênh của bạn.
- Hình ảnh nhân vật và bối cảnh đền Tử Vi được thiết kế riêng cho dự án; âm nhạc cổ phong và hiệu ứng chuông mõ được tổng hợp bằng Web Audio ngay trong mã nguồn.
- Dự án phát hành theo giấy phép MIT bởi **BEAR DEV**.

## Miễn trừ trách nhiệm

Dự án được chia sẻ **miễn phí, với mục đích học tập, giải trí văn hóa dân gian và tham khảo lập trình**. Phần mềm được cung cấp "nguyên trạng" (AS IS), không kèm bất kỳ bảo đảm nào.

Mọi quẻ Kinh Dịch, lời phán và nội dung luận giải trong ứng dụng **chỉ mang tính chất tham khảo, giải trí văn hóa đầu xuân**, không phải lời khuyên chuyên môn hay mê tín dị đoan. Khi tải về, sử dụng, chỉnh sửa hoặc phân phối lại mã nguồn này, **bạn tự chịu hoàn toàn trách nhiệm** về nội dung bạn phát, việc nhận quà/donation, việc tuân thủ điều khoản TikTok và pháp luật nơi bạn hoạt động, cũng như mọi rủi ro phát sinh.

## Ghi nhận

Phát triển bởi **BEAR DEV** trên nền kiến trúc TikTok LIVE 2.5D. Nếu bạn phân phối hoặc chỉnh sửa tiếp, hãy giữ lại `LICENSE` và phần ghi nhận nguồn **BEAR DEV** này.

## Giấy phép

MIT, xem `LICENSE`.
