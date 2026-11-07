window.BeerScene = (function(){
  const SW = 1080, SH = 1920;

  const DEFAULT_FOOD_FROM = 6, DEFAULT_BEER_FROM = 18;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  function schedule(settings){
    let foodFrom = Number(settings?.foodFrom), beerFrom = Number(settings?.beerFrom);
    if (!(foodFrom >= 0 && foodFrom < 24)) foodFrom = DEFAULT_FOOD_FROM;
    if (!(beerFrom >= 0 && beerFrom < 24)) beerFrom = DEFAULT_BEER_FROM;
    if (beerFrom <= foodFrom + 1){ foodFrom = DEFAULT_FOOD_FROM; beerFrom = DEFAULT_BEER_FROM; }
    return { foodFrom, beerFrom };
  }

  function nightAt(settings, date = new Date()){
    const mode = settings?.phaseMode || 'auto';
    if (mode === 'food') return 0;
    if (mode === 'beer') return 1;
    const { foodFrom, beerFrom } = schedule(settings);
    const h = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    if (h >= foodFrom + .5 && h < beerFrom - .5) return 0;
    if (h >= beerFrom + .5 || h < foodFrom - .5) return 1;
    if (h >= beerFrom - .5) return smoothstep(beerFrom - .5, beerFrom + .5, h);
    return 1 - smoothstep(foodFrom - .5, foodFrom + .5, h);
  }

  function nextSwitch(settings, date = new Date()){
    const { foodFrom, beerFrom } = schedule(settings);
    const h = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    const night = nightAt(settings, date) >= .5;
    const target = night ? foodFrom : beerFrom;
    let wait = target - h;
    if (wait <= 0) wait += 24;
    return { at: target, wait, night, label: night ? 'Khai Lộc · Ban Ngày' : 'Huyền Bí · Ban Đêm' };
  }

  function phaseInfo(settings, date = new Date()){
    const night = nightAt(settings, date);
    const food = night < .5;
    return {
      night, food,
      label: food ? 'Khai Lộc · Sáng' : 'Linh Đàn · Đêm',
      short: food ? 'Ban ngày' : 'Ban đêm',
      icon: food ? '☀' : '☯',
      next: nextSwitch(settings, date),
    };
  }

  const WALK_HIP = 310;
  const ACTIVE_SPOT = { id: 'active_mat', x: 540, y: 1415, scale: 0.48, gap: 280 };

  const CARPET_ROWS = [
    { zone: 0, y: 1585, scale: 0.44, xs: [340, 540, 740], showEmpty: true },
    { zone: 1, y: 1710, scale: 0.41, xs: [275, 452, 628, 805], showEmpty: true },
    { zone: 2, y: 1825, scale: 0.38, xs: [220, 380, 540, 700, 860], showEmpty: false },
    { zone: 3, y: 1520, scale: 0.37, xs: [250, 440, 640, 830], showEmpty: false },
    { zone: 4, y: 1648, scale: 0.36, xs: [200, 370, 540, 710, 880], showEmpty: false },
    { zone: 5, y: 1768, scale: 0.35, xs: [165, 315, 465, 615, 765, 915], showEmpty: false },
    { zone: 6, y: 1875, scale: 0.34, xs: [145, 275, 405, 540, 675, 805, 935], showEmpty: false },
  ];

  function layout(cap){
    const tables = [];
    const all = [];
    let seq = 0;
    for (const row of CARPET_ROWS){
      const w = 130 * row.scale / 0.42;
      for (let i = 0; i < row.xs.length; i++){
        const cx = row.xs[i];
        const table = {
          kind: 'mat', zone: row.zone, id: `m${seq++}`, cx, y: row.y, w, depth: w * 0.46,
          scale: row.scale, showEmpty: row.showEmpty && row.zone <= 1,
          color: seq % 2 === 0 ? 'red' : 'gold', chairColor: 'gold',
          nearSeats: [], farSeats: [], seats: [],
        };
        const seat = {
          id: `${table.id}_s0`, table, side: 'near', index: 0,
          x: cx, y: row.y, scale: row.scale,
          gap: row.xs.length > 1 ? Math.abs(row.xs[1] - row.xs[0]) : 200,
          tagLift: 0, taken: null,
        };
        table.nearSeats.push(seat);
        table.seats.push(seat);
        tables.push(table);
        all.push(seat);
      }
    }
    const want = Math.max(1, Math.min(64, Number(cap) || 12));
    const seats = all.slice(0, Math.min(all.length, want));
    const usedIds = new Set(seats.map(s => s.table.id));
    const activeTables = tables.filter(t => usedIds.has(t.id));
    return { cap: seats.length, tables: activeTables, seats, activeSpot: ACTIVE_SPOT };
  }

  const SKINS = ['man', 'woman', 'uncle', 'cap', 'sexy', 'oldwoman'];
  const SKIN_GROUPS = {
    male:     { label: 'Nam · Công tử', skins: ['man', 'cap'] },
    female:   { label: 'Nữ · Tiểu thư', skins: ['woman', 'sexy'] },
    oldman:   { label: 'Ông già',       skins: ['uncle'] },
    oldwoman: { label: 'Bà già',        skins: ['oldwoman'] },
  };
  const backKey = skin => skin;
  const frontKey = skin => skin;
  const walkKey = skin => `walk_${skin}`;
  function activityKey(skin){ return skin; }

  const MENU = [
    { id: 'khai_loc',    label: 'Khai Lộc',    coins: 1,   maxCoins: 9,   dur: 18, unit: 'quẻ ngắn',     icon: '🪙', desc: '1–9 KC · 18s · Luận nên hay chưa nên' },
    { id: 'phuc_loc',    label: 'Phúc Lộc',    coins: 10,  maxCoins: 29,  dur: 25, unit: 'quẻ sâu',      icon: '📜', desc: '10–29 KC · 25s · Luận tượng quẻ & hào động' },
    { id: 'thien_loc',   label: 'Thiên Lộc',   coins: 30,  maxCoins: 69,  dur: 35, unit: 'quẻ chi tiết', icon: '🔮', desc: '30–69 KC · 35s · Thời điểm thuận lợi' },
    { id: 'long_phuong', label: 'Long Phượng', coins: 70,  maxCoins: 149, dur: 48, unit: 'đại quẻ',      icon: '🐉', desc: '70–149 KC · 48s · Quý nhân, hướng & màu hợp' },
    { id: 'thien_menh',  label: 'Thiên Mệnh',  coins: 150, maxCoins: 9999,dur: 65, unit: 'thiên mệnh',   icon: '👑', desc: '150+ KC · 65s · Luận trọn vẹn đại cát' },
  ];

  const TOPICS = [
    { id: 'tinh_duyen', label: 'Tình Duyên', icon: '💕', words: ['tinh duyen', 'tinh cam', 'nguoi yeu', 'vo chong', 'hon nhan', 'crush', 'duyen', 'ny', 'yeu', 'chia tay', 'quay lai'] },
    { id: 'tai_loc',    label: 'Tài Lộc',    icon: '💰', words: ['tai loc', 'tien bac', 'loc', 'kinh doanh', 'buon ban', 'lam an', 'dau tu', 'tien', 'no nan', 'giau', 'mua ban'] },
    { id: 'su_nghiep',  label: 'Sự Nghiệp',  icon: '📈', words: ['su nghiep', 'cong viec', 'cong danh', 'thi cu', 'hoc tap', 'thang tien', 'viec lam', 'xin viec', 'chuyen viec'] },
    { id: 'gia_dao',    label: 'Gia Đạo',    icon: '🏡', words: ['gia dao', 'gia dinh', 'con cai', 'nha cua', 'cha me', 'anh em', 'xay nha', 'dat dai'] },
    { id: 'suc_khoe',   label: 'Sức Khỏe',   icon: '🌿', words: ['suc khoe', 'benh', 'cau an', 'binh an', 'tho', 'om dau', 'tai qua'] },
    { id: 'tong_quan',  label: 'Vận Mệnh',   icon: '☯',  words: ['van menh', 'tong quan', 'tu vi', 'gieo que', 'xin que', 'xem que', 'que'] },
  ];

  function normText(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function topicFromText(raw){
    const s = normText(raw);
    if (!s) return null;
    for (const tp of TOPICS){
      if (tp.words.some(w => s.includes(w))) return tp;
    }
    return null;
  }

  function tierFromCoins(coins){
    const n = Math.max(1, Math.floor(coins || 1));
    if (n >= 150) return MENU[4];
    if (n >= 70) return MENU[3];
    if (n >= 30) return MENU[2];
    if (n >= 10) return MENU[1];
    return MENU[0];
  }

  function orderFromCoins(coins, topicLabel){
    const n = Math.max(1, Math.floor(coins || 1));
    const tier = tierFromCoins(n);
    const tp = topicLabel || 'Vận Mệnh';
    return {
      tierId: tier.id,
      tierLabel: tier.label,
      dur: tier.dur,
      icon: tier.icon,
      coins: n,
      topic: tp,
      text: `${tier.label} · ${tp}`,
      label: `${tier.icon} ${tier.label.toUpperCase()}`,
    };
  }

  const HEXAGRAMS = [
    {
      num: 1, name: 'Thuần Càn', rank: 'Thượng Thượng Cát', changed: 'Thiên Phong Cấu',
      lines: [1, 1, 1, 1, 1, 1],
      verse: 'Rồng bay trên chín tầng mây, thời vận hanh thông vạn sự thành.',
      topics: {
        tinh_duyen: 'Nhân duyên sáng rõ, đôi bên tâm đầu ý hợp, người độc thân dễ gặp lương duyên cao quý.',
        tai_loc: 'Tài lộc vượng phát như rồng gặp mây, mưu sự lớn ắt thu về lộc dày.',
        su_nghiep: 'Công danh thăng tiến mạnh mẽ, được cấp trên trọng dụng, mở ra cơ hội dẫn đầu.',
        gia_dao: 'Gia môn hưng thịnh, trên dưới thuận hòa, đón tin vui từ người thân.',
        suc_khoe: 'Tinh thần sung mãn, dương khí dồi dào, bệnh tật tiêu trừ.',
        tong_quan: 'Nguyên hanh lợi trinh, vạn sự khởi đầu đều thuận buồm xuôi gió.',
      },
      advice: 'Giữ tâm khiêm cung giữa lúc thịnh vượng thì phúc lộc bền lâu.',
      lucky: { time: 'Tháng âm lịch tới & giờ Thìn, Ngọ', noble: 'Người tuổi Thìn, Thân, Tý', dir: 'Hướng Đông Nam · Màu Vàng Kim, Đỏ' }
    },
    {
      num: 14, name: 'Hỏa Thiên Đại Hữu', rank: 'Đại Cát Vượng Tài', changed: 'Hỏa Phong Đỉnh',
      lines: [1, 1, 1, 1, 0, 1],
      verse: 'Mặt trời tỏa sáng giữa trời cao, phúc lộc đầy nhà vạn điều may.',
      topics: {
        tinh_duyen: 'Tình cảm nồng ấm, chân thành gắn kết, nhân duyên đơm hoa kết trái.',
        tai_loc: 'Đại hữu là có nhiều lộc lớn, tiền tài tụ về từ nhiều nguồn thuận lợi.',
        su_nghiep: 'Uy tín vang xa, hợp tác làm ăn gặp người đồng tâm hiệp lực.',
        gia_dao: 'Trong ấm ngoài êm, gia đình sung túc, con cháu hiếu thuận.',
        suc_khoe: 'Khí huyết lưu thông, thân tâm an lạc, gặp thầy gặp thuốc.',
        tong_quan: 'Thời vận đang độ rực rỡ, cầu tài đắc tài, cầu lộc đắc lộc.',
      },
      advice: 'Biết sẻ chia phước báu và hành thiện tích đức sẽ giữ được đại lộc.',
      lucky: { time: 'Trong 15 ngày tới & giờ Tỵ, Ngọ', noble: 'Người tuổi Ngọ, Dần, Tuất', dir: 'Hướng Nam · Màu Đỏ Son, Cam Vàng' }
    },
    {
      num: 11, name: 'Địa Thiên Thái', rank: 'Thượng Cát · Hanh Thông', changed: 'Địa Trạch Lâm',
      lines: [1, 1, 1, 0, 0, 0],
      verse: 'Trời đất giao hòa muôn vật sinh sôi, tiểu vãng đại lai phúc lộc về.',
      topics: {
        tinh_duyen: 'Đôi lứa hòa hợp như đất với trời, hiểu lầm hóa giải, tình duyên bền chặt.',
        tai_loc: 'Bế tắc đã qua, vận may tài chính mở rộng, buôn may bán đắt.',
        su_nghiep: 'Mọi kế hoạch đang ấp ủ đều gặp thiên thời địa lợi nhân hòa.',
        gia_dao: 'Gia đạo bình an, tiếng cười ngập tràn, đón hỷ sự trong nhà.',
        suc_khoe: 'Âm dương cân bằng, cơ thể hồi phục nhanh chóng.',
        tong_quan: 'Cái nhỏ đi qua, cái lớn đang tới, vận trình chuyển mình rực rỡ.',
      },
      advice: 'Nắm bắt thời cơ ngay khi vận mở, chớ chần chừ bỏ lỡ cơ duyên.',
      lucky: { time: 'Đầu tháng âm lịch & giờ Mão, Thìn', noble: 'Người tuổi Sửu, Mùi, Thìn', dir: 'Hướng Đông Bắc · Màu Vàng Đất, Xanh Ngọc' }
    },
    {
      num: 22, name: 'Sơn Hỏa Bí', rank: 'Bình Hòa · Cát Tường', changed: 'Địa Hỏa Minh Di',
      lines: [1, 0, 1, 0, 0, 1],
      verse: 'Ánh lửa soi sáng chân núi, văn vẻ rạng ngời, việc nhỏ hanh thông.',
      topics: {
        tinh_duyen: 'Duyên lành đến từ sự chân thành, đừng chỉ nhìn vẻ hào nhoáng bên ngoài.',
        tai_loc: 'Lộc đến đều đặn, thích hợp củng cố nền tảng hơn là mạo hiểm lớn.',
        su_nghiep: 'Danh tiếng và tài năng được ghi nhận, thuận lợi cho giấy tờ, thi cử.',
        gia_dao: 'Nhà cửa trang hoàng ấm cúng, gia đình hòa thuận yên vui.',
        suc_khoe: 'Chú ý nghỉ ngơi điều độ, giữ tâm thanh tịnh tránh lo âu.',
        tong_quan: 'Quẻ chủ về sự tốt đẹp, sáng sủa, làm việc có kế hoạch ắt thành.',
      },
      advice: 'Lấy sự chân thật làm gốc, văn chất hài hòa thì phúc tự tìm đến.',
      lucky: { time: 'Cuối tuần này & giờ Dần, Ngọ', noble: 'Người tuổi Dần, Ngọ, Hợi', dir: 'Hướng Đông · Màu Trắng Kem, Đỏ Đô' }
    },
    {
      num: 15, name: 'Địa Sơn Khiêm', rank: 'Lục Hào Giai Cát', changed: 'Địa Hỏa Minh Di',
      lines: [0, 0, 1, 0, 0, 0],
      verse: 'Núi cao ẩn mình trong lòng đất, người khiêm nhường ắt được trời ban phúc.',
      topics: {
        tinh_duyen: 'Nhường nhịn và thấu hiểu giúp tình yêu vượt qua mọi thử thách, kết thành đôi.',
        tai_loc: 'Tài lộc tích tụ bền vững, càng khiêm tốn làm ăn càng thu lợi lớn.',
        su_nghiep: 'Được lòng cả cấp trên lẫn đồng nghiệp, quý nhân âm thầm nâng đỡ.',
        gia_dao: 'Gia phong lễ nghĩa, phúc đức tổ tiên che chở cho cả nhà.',
        suc_khoe: 'Bình an vô sự, tâm an thì vạn bệnh lùi xa.',
        tong_quan: 'Trong 64 quẻ Kinh Dịch, chỉ duy nhất quẻ Khiêm cả 6 hào đều tốt lành.',
      },
      advice: 'Lùi một bước biển rộng trời cao, mềm mỏng ắt thắng cứng rắn.',
      lucky: { time: 'Mọi khung giờ hoàng đạo trong tháng', noble: 'Người lớn tuổi trong gia đình', dir: 'Hướng Tây Nam · Màu Nâu Vàng, Trắng' }
    },
    {
      num: 31, name: 'Trạch Sơn Hàm', rank: 'Đại Cát Nhân Duyên', changed: 'Trạch Hỏa Cách',
      lines: [0, 0, 1, 1, 1, 0],
      verse: 'Núi đầm giao cảm, tâm linh tương thông, hữu duyên thiên lý năng tương ngộ.',
      topics: {
        tinh_duyen: 'Quẻ thượng cát về tình duyên! Đôi bên rung động chân thành, sớm có tin vui cưới hỏi hoặc tỏ tình.',
        tai_loc: 'Hợp tác ăn ý sinh tài lộc, khách hàng quý mến tìm đến.',
        su_nghiep: 'Giao tiếp thuận lợi, ký kết hợp đồng hay thương thảo đều suôn sẻ.',
        gia_dao: 'Vợ chồng đồng lòng, gia đình gắn kết yêu thương.',
        suc_khoe: 'Tâm trạng phấn chấn, tinh thần vui vẻ giúp cơ thể khỏe khoắn.',
        tong_quan: 'Vạn vật cảm ứng bằng chữ Tâm, cầu duyên đắc duyên, cầu hợp tác ắt thành.',
      },
      advice: 'Mở lòng đón nhận thiện ý, lắng nghe trực giác mách bảo.',
      lucky: { time: 'Rằm & mùng 1 âm lịch, giờ Dậu, Tuất', noble: 'Người khác giới tuổi Dậu, Sửu', dir: 'Hướng Tây · Màu Hồng Sen, Vàng Ánh Kim' }
    },
    {
      num: 50, name: 'Hỏa Phong Đỉnh', rank: 'Thượng Cát · Đổi Mới', changed: 'Hỏa Thiên Đại Hữu',
      lines: [0, 1, 1, 1, 0, 1],
      verse: 'Vạc vàng luyện ngọc, rũ bỏ cái cũ đón vận mới huy hoàng.',
      topics: {
        tinh_duyen: 'Mối quan hệ bước sang trang mới vững chắc, chín chắn và sâu sắc hơn.',
        tai_loc: 'Đầu tư đúng hướng, tài lộc chín muồi, thu hoạch thành quả xứng đáng.',
        su_nghiep: 'Vững vàng như chân vạc, khẳng định vị thế và bản lĩnh vững chắc.',
        gia_dao: 'Gia đình sung túc, bếp lửa luôn ấm, đón thêm tài sản mới.',
        suc_khoe: 'Bồi bổ đúng cách giúp sức khỏe dồi dào, tràn đầy sinh lực.',
        tong_quan: 'Cơ hội chuyển mình lên tầm cao mới, quý nhân trao quyền trợ lực.',
      },
      advice: 'Giữ chữ Tín và sự kiên định như vạc đồng ba chân thì đại sự tất thành.',
      lucky: { time: 'Tháng tới & giờ Tỵ, Mùi', noble: 'Người tuổi Mão, Ngọ, Mùi', dir: 'Hướng Nam · Màu Đỏ, Xanh Lá' }
    },
    {
      num: 42, name: 'Phong Lôi Ích', rank: 'Thượng Cát · Tăng Phúc', changed: 'Phong Hỏa Gia Nhân',
      lines: [1, 0, 0, 0, 1, 1],
      verse: 'Gió sấm tương trợ, mưa thuận gió hòa, làm một hưởng mười.',
      topics: {
        tinh_duyen: 'Tình cảm ngày càng gắn bó, đôi bên cùng nâng đỡ nhau tiến bộ.',
        tai_loc: 'Quẻ Ích chủ về thêm lộc thêm tài, lợi nhuận gia tăng vượt kỳ vọng.',
        su_nghiep: 'Thời cơ bứt phá đã điểm, mạnh dạn khởi sự hoặc mở rộng quy mô.',
        gia_dao: 'Thêm người thêm của, phúc khí tràn đầy trong gia quyến.',
        suc_khoe: 'Sức khỏe chuyển biến tích cực, tinh thần minh mẫn.',
        tong_quan: 'Thiên thời đang ủng hộ, tiến hành việc lớn hay nhỏ đều có lợi.',
      },
      advice: 'Thấy việc thiện nên làm ngay, thấy điều chưa chuẩn kịp thời sửa đổi.',
      lucky: { time: 'Trong 10 ngày tới & giờ Mão, Thìn', noble: 'Người tuổi Thìn, Tỵ, Dần', dir: 'Hướng Đông · Màu Xanh Ngọc, Vàng' }
    },
  ];

  function castHexagram(topicId = 'tong_quan', tierId = 'khai_loc', seed = 0){
    const idx = Math.floor(Math.abs(seed || (Date.now() + Math.random() * 1000))) % HEXAGRAMS.length;
    const h = HEXAGRAMS[idx];
    const moving = 1 + (Math.floor(Math.abs(seed * 7 || Date.now())) % 6);
    const coins = [0, 1, 2].map(() => (Math.random() < 0.58 ? 1 : 0));
    const tpKey = h.topics[topicId] ? topicId : 'tong_quan';
    const topicObj = TOPICS.find(x => x.id === tpKey) || TOPICS[5];
    const mainText = h.topics[tpKey];
    let fullReading = `Quẻ số ${h.num}: ${h.name} (${h.rank}). ${h.verse} Về ${topicObj.label.toLowerCase()}: ${mainText}`;
    if (tierId !== 'khai_loc') {
      fullReading += ` Hào động tại hào ${moving}, biến sang quẻ ${h.changed}. Lời khuyên: ${h.advice}`;
    }
    if (tierId === 'thien_loc' || tierId === 'long_phuong' || tierId === 'thien_menh') {
      fullReading += ` Thời điểm thuận lợi: ${h.lucky.time}.`;
    }
    if (tierId === 'long_phuong' || tierId === 'thien_menh') {
      fullReading += ` Quý nhân phù trợ: ${h.lucky.noble}. Hướng và màu hợp: ${h.lucky.dir}.`;
    }
    return {
      num: h.num,
      name: h.name,
      rank: h.rank,
      changed: h.changed,
      lines: h.lines,
      moving,
      coins,
      verse: h.verse,
      topicId: tpKey,
      topicLabel: topicObj.label,
      mainText,
      advice: h.advice,
      lucky: h.lucky,
      fullReading,
    };
  }

  function ellipse(g, x, y, rx, ry){ g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.2832); }
  function roundRect(g, x, y, w, h, r){
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function shadow(g, x, y, s, alpha = .25){
    g.save();
    g.fillStyle = `rgba(10,4,2,${alpha})`;
    ellipse(g, x, y, 108 * s, 24 * s); g.fill();
    g.restore();
  }

  function drawBackground(g, imgs, night, w = SW, h = SH){
    if (imgs?.light?.naturalWidth) g.drawImage(imgs.light, 0, 0, w, h);
    else if (imgs?.dark?.naturalWidth) g.drawImage(imgs.dark, 0, 0, w, h);
    if (night > .001 && imgs?.dark?.naturalWidth){
      g.save(); g.globalAlpha = night; g.drawImage(imgs.dark, 0, 0, w, h); g.restore();
    }
  }

  const ZODIACS = [
    ['Tý', '子'], ['Sửu', '丑'], ['Dần', '寅'], ['Mão', '卯'],
    ['Thìn', '辰'], ['Tỵ', '巳'], ['Ngọ', '午'], ['Mùi', '未'],
    ['Thân', '申'], ['Dậu', '酉'], ['Tuất', '戌'], ['Hợi', '亥'],
  ];
  const TRIGRAMS = [
    [1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1],
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  ];

  function drawBaguaWheel(g, cx, cy, r, t, spinBoost = 0){
    g.save();
    g.translate(cx, cy);

    const glowA = 0.22 + 0.12 * Math.sin(t * 2.2) + spinBoost * 0.35;
    const halo = g.createRadialGradient(0, 0, r * 0.25, 0, 0, r * 1.22);
    halo.addColorStop(0, `rgba(255, 210, 95, ${glowA})`);
    halo.addColorStop(0.65, `rgba(235, 145, 35, ${glowA * 0.55})`);
    halo.addColorStop(1, 'rgba(180, 70, 10, 0)');
    g.fillStyle = halo;
    g.beginPath();
    g.arc(0, 0, r * 1.22, 0, 6.2832);
    g.fill();

    const plateGrd = g.createRadialGradient(0, 0, 10, 0, 0, r);
    plateGrd.addColorStop(0, 'rgba(58, 32, 12, 0.92)');
    plateGrd.addColorStop(0.7, 'rgba(38, 20, 8, 0.92)');
    plateGrd.addColorStop(1, 'rgba(24, 11, 4, 0.95)');
    g.fillStyle = plateGrd;
    g.beginPath();
    g.arc(0, 0, r, 0, 6.2832);
    g.fill();

    g.lineWidth = 4;
    g.strokeStyle = '#f5c453';
    g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.stroke();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255, 215, 115, 0.65)';
    g.beginPath(); g.arc(0, 0, r * 0.72, 0, 6.2832); g.stroke();
    g.beginPath(); g.arc(0, 0, r * 0.42, 0, 6.2832); g.stroke();

    g.save();
    g.rotate(t * 0.08 + spinBoost * 1.8);
    for (let i = 0; i < 12; i++) {
      const a0 = (i - 0.5) * Math.PI / 6 - Math.PI / 2;
      const a1 = (i + 0.5) * Math.PI / 6 - Math.PI / 2;
      g.strokeStyle = 'rgba(255, 210, 110, 0.35)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(Math.cos(a0) * r * 0.72, Math.sin(a0) * r * 0.72);
      g.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
      g.stroke();

      const mid = (a0 + a1) / 2;
      g.save();
      g.translate(Math.cos(mid) * r * 0.86, Math.sin(mid) * r * 0.86);
      g.rotate(mid + Math.PI / 2);
      const active = Math.floor((t * (1.2 + spinBoost * 8)) % 12) === i;
      g.fillStyle = active ? '#fff4b8' : '#e8bd63';
      g.font = `800 ${Math.round(r * 0.105)}px "Be Vietnam Pro", system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(ZODIACS[i][0], 0, 0);
      g.restore();
    }
    g.restore();

    g.save();
    g.rotate(-t * 0.14 - spinBoost * 2.4);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 - Math.PI / 2;
      g.save();
      g.translate(Math.cos(a) * r * 0.57, Math.sin(a) * r * 0.57);
      g.rotate(a + Math.PI / 2);
      const bars = TRIGRAMS[i];
      const bw = r * 0.15, bh = 4.2, gap = 3.6;
      g.fillStyle = '#f5c85c';
      for (let b = 0; b < 3; b++) {
        const by = (b - 1) * (bh + gap);
        if (bars[b] === 1) {
          g.fillRect(-bw / 2, by - bh / 2, bw, bh);
        } else {
          const seg = bw * 0.42;
          g.fillRect(-bw / 2, by - bh / 2, seg, bh);
          g.fillRect(bw / 2 - seg, by - bh / 2, seg, bh);
        }
      }
      g.restore();
    }
    g.restore();

    if (window.BeerFX) {
      window.BeerFX.yinyang(g, 0, 0, r * 0.34, t * 0.45 + spinBoost * 4.5, 0.96);
    }
    g.restore();
  }

  function drawAmbient(g, night, t, spinBoost = 0){
    drawBaguaWheel(g, 540, 862, 194, t, spinBoost);

    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const [lx, ly] of [[126, 510], [954, 510]]) {
      const pulse = 0.78 + 0.22 * Math.sin(t * 2.6 + lx);
      const lg = g.createRadialGradient(lx, ly, 10, lx, ly, 190);
      lg.addColorStop(0, `rgba(255, 160, 65, ${0.28 * pulse})`);
      lg.addColorStop(0.5, `rgba(255, 90, 30, ${0.11 * pulse})`);
      lg.addColorStop(1, 'rgba(255, 60, 10, 0)');
      g.fillStyle = lg;
      g.beginPath(); g.arc(lx, ly, 190, 0, 6.2832); g.fill();
    }

    for (const [cx, cy] of [[323, 1038], [806, 1038]]) {
      const flk = 0.8 + 0.2 * Math.sin(t * 11 + cx);
      const cg = g.createRadialGradient(cx, cy, 2, cx, cy, 52);
      cg.addColorStop(0, `rgba(255, 230, 140, ${0.42 * flk})`);
      cg.addColorStop(1, 'rgba(255, 140, 30, 0)');
      g.fillStyle = cg;
      g.beginPath(); g.arc(cx, cy, 52, 0, 6.2832); g.fill();
    }
    g.restore();

    steamWisp(g, 882, 955, 1.35, t * 0.85);
  }

  function drawCoinTray(g, cx, cy, s, t, castState){
    g.save();
    g.translate(cx, cy);
    g.scale(s, s);

    g.fillStyle = 'rgba(8, 3, 1, 0.42)';
    ellipse(g, 0, 12, 152, 40);
    g.fill();

    const rimGrd = g.createLinearGradient(-148, -20, 148, 25);
    rimGrd.addColorStop(0, '#a66b14');
    rimGrd.addColorStop(0.35, '#ffd978');
    rimGrd.addColorStop(0.7, '#d19224');
    rimGrd.addColorStop(1, '#754607');
    g.fillStyle = rimGrd;
    ellipse(g, 0, 5, 146, 36);
    g.fill();

    const topGrd = g.createRadialGradient(-20, -6, 12, 0, 0, 140);
    topGrd.addColorStop(0, '#fff1b5');
    topGrd.addColorStop(0.55, '#e8ae38');
    topGrd.addColorStop(0.9, '#b57814');
    topGrd.addColorStop(1, '#8c5809');
    g.fillStyle = topGrd;
    ellipse(g, 0, -2, 138, 32);
    g.fill();

    g.strokeStyle = '#ffebad';
    g.lineWidth = 2.2;
    ellipse(g, 0, -2, 124, 27);
    g.stroke();

    const active = castState && castState.active;
    const prog = active ? clamp01(castState.progress || 0) : 0;
    const coins = (castState && castState.coins) || [1, 0, 1];
    const offsets = [[-46, -4], [4, -10], [50, -2]];

    if (active && prog > 0.05 && prog < 0.92) {
      const ringA = Math.sin(prog * Math.PI) * 0.65;
      g.strokeStyle = `rgba(255, 230, 130, ${ringA})`;
      g.lineWidth = 3;
      ellipse(g, 0, -2, 135 + prog * 45, 30 + prog * 12);
      g.stroke();
    }

    for (let i = 0; i < 3; i++) {
      const [ox, oy] = offsets[i];
      let lift = 0, spin = 0.95, tilt = (i - 1) * 0.25;
      if (active) {
        const localP = clamp01((prog - i * 0.08) / 0.78);
        lift = Math.sin(localP * Math.PI) * 165;
        if (localP > 0 && localP < 1) {
          spin = localP * Math.PI * 8 + i * 1.7;
          tilt += Math.sin(localP * 12) * 0.4;
        }
      }
      g.fillStyle = `rgba(20, 8, 2, ${Math.max(0.08, 0.28 - lift / 700)})`;
      ellipse(g, ox, oy + 4, 22 * (1 - lift / 500), 8 * (1 - lift / 500));
      g.fill();
      if (window.BeerFX) {
        window.BeerFX.coin(g, ox, oy - lift, 0.74, {
          tilt,
          spin: active && lift > 2 ? spin : 1.05,
          yang: coins[i] !== 0,
        });
      }
    }
    g.restore();
  }

  function drawMaster(g, sp, masterState, t){
    const mx = 540, my = 1138, ms = 0.88;
    const mode = masterState?.mode || 'idle';
    let key = 'master_idle';
    let bob = Math.sin(t * 2.2) * 3.5;
    let rot = 0;
    if (mode === 'shake') {
      key = 'master_shake';
      bob = Math.abs(Math.sin(t * 22)) * -10;
      rot = Math.sin(t * 28) * 0.055;
    } else if (mode === 'cast') {
      key = 'master_cast';
      bob = Math.sin(t * 6) * -5;
    } else if (mode === 'read') {
      key = 'master_read';
      bob = Math.sin(t * 4.5) * 3;
      rot = Math.sin(t * 3.2) * 0.015;
    }
    if (!sp.has(key)) key = 'master_idle';

    shadow(g, mx, my - 8, 1.35, 0.38);

    if (mode !== 'idle') {
      g.save();
      g.globalCompositeOperation = 'lighter';
      const a = 0.24 + 0.12 * Math.sin(t * 8);
      const rg = g.createRadialGradient(mx, my - 210, 20, mx, my - 210, 240);
      rg.addColorStop(0, `rgba(255, 215, 105, ${a})`);
      rg.addColorStop(1, 'rgba(255, 150, 40, 0)');
      g.fillStyle = rg;
      g.beginPath(); g.arc(mx, my - 210, 240, 0, 6.2832); g.fill();
      g.restore();
    }

    g.save();
    g.translate(mx, my + bob);
    if (rot) g.rotate(rot);
    sp.draw(g, key, 0, 0, ms, 1);
    g.restore();
  }

  function drawSeekerMat(g, x, y, s, isMain = false, showEmpty = false, taken = false){
    const w = (isMain ? 250 : 215) * s;
    const h = (isMain ? 76 : 64) * s;
    g.save();
    g.fillStyle = 'rgba(8, 3, 1, 0.34)';
    roundRect(g, x - w / 2, y - h * 0.45 + 5, w, h, 12 * s);
    g.fill();

    const borderGrd = g.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    if (isMain) {
      borderGrd.addColorStop(0, '#ffd86b');
      borderGrd.addColorStop(0.5, '#d94126');
      borderGrd.addColorStop(1, '#ffd86b');
    } else {
      borderGrd.addColorStop(0, '#b8291e');
      borderGrd.addColorStop(0.5, '#e09f3e');
      borderGrd.addColorStop(1, '#8f1d14');
    }
    g.fillStyle = borderGrd;
    roundRect(g, x - w / 2, y - h * 0.45, w, h, 11 * s);
    g.fill();

    const pad = Math.max(4, 11 * s);
    const matGrd = g.createLinearGradient(x, y - h * 0.45 + pad, x, y + h * 0.55 - pad);
    matGrd.addColorStop(0, '#f3dfa6');
    matGrd.addColorStop(0.5, '#dfbe73');
    matGrd.addColorStop(1, '#c49b4b');
    g.fillStyle = matGrd;
    roundRect(g, x - w / 2 + pad, y - h * 0.45 + pad * 0.7, w - pad * 2, h - pad * 1.4, 7 * s);
    g.fill();

    g.strokeStyle = 'rgba(120, 75, 18, 0.28)';
    g.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      const ly = y + i * (h * 0.12);
      g.beginPath();
      g.moveTo(x - w / 2 + pad * 1.3, ly);
      g.lineTo(x + w / 2 - pad * 1.3, ly);
      g.stroke();
    }

    if (!taken && showEmpty) {
      const pw = Math.max(82, 145 * s), ph = Math.max(22, 34 * s);
      g.fillStyle = 'rgba(20, 8, 6, 0.76)';
      roundRect(g, x - pw / 2, y - ph / 2, pw, ph, ph / 2);
      g.fill();
      g.strokeStyle = 'rgba(255, 210, 115, 0.65)';
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = '#ffe6b0';
      g.font = `700 ${Math.max(12, Math.round(20 * s))}px "Be Vietnam Pro", system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(isMain ? 'Chiếu luận quẻ' : 'Vị trí trống', x, y + 1);
    }
    g.restore();
  }

  function steamWisp(g, x, y, s, t){
    g.save();
    g.strokeStyle = 'rgba(255,245,220,.32)';
    g.lineWidth = 2.4 * s;
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++){
      const ph = t * 1.5 + i * 2.1;
      const dx = Math.sin(ph) * 8 * s;
      g.globalAlpha = .24 + .15 * Math.sin(ph * .7);
      g.beginPath();
      g.moveTo(x + (i - 1) * 7 * s, y);
      g.bezierCurveTo(x + dx, y - 16 * s, x - dx, y - 32 * s, x + dx * .6, y - 48 * s);
      g.stroke();
    }
    g.restore();
  }

  function drawTable(g, t){
    const seat = t.nearSeats[0];
    drawSeekerMat(g, t.cx, t.y, t.scale, false, t.showEmpty, !!(seat && seat.taken));
  }
  function drawChairBack(){}
  function drawEndChairs(){}
  function props(){}
  function bottle(){}
  function bowl(g, x, y, s){
    if (window.BeerFX) window.BeerFX.lotus(g, x, y, s * 1.1);
  }
  function mug(g, x, y, s){
    if (window.BeerFX) window.BeerFX.ingot(g, x, y, s * 0.9);
  }
  function drawEmptyChair(){}
  function drawSteam(g, x, y, s, t, alpha = .8){
    g.save(); g.globalAlpha = alpha; steamWisp(g, x, y, s, t); g.restore();
  }

  return {
    SW, SH, SKINS, SKIN_GROUPS, MENU, TOPICS, HEXAGRAMS,
    orderFromCoins, tierFromCoins, topicFromText, castHexagram,
    WALK_HIP, ACTIVE_SPOT, layout, phaseInfo, nightAt, nextSwitch, schedule,
    backKey, frontKey, walkKey, activityKey,
    drawBackground, drawAmbient, drawBaguaWheel, drawMaster, drawCoinTray, drawSeekerMat,
    drawTable, drawProps: props, drawChairBack, drawEndChairs, drawSteam,
    drawShadow: shadow, drawEmptyChair, drawBottle: bottle, drawBowl: bowl, drawMug: mug,
  };
})();
