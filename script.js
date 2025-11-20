// 背景の泡（うっすらノイズ用）
window.addEventListener("load", () => {
	const canvas = document.getElementById("bg-canvas");
	if (!canvas || typeof Particles === "undefined") return;

	Particles.init({
		selector: "#bg-canvas",
		maxParticles: 90,
		sizeVariations: 4,
		speed: 0.25,
		color: ["#ccccbb", "#aaaa99", "#ddd0b0"],
		connectParticles: false,
		responsive: [
			{
				breakpoint: 1024,
				options: {
					maxParticles: 70
				}
			},
			{
				breakpoint: 640,
				options: {
					maxParticles: 40,
					speed: 0.2
				}
			},
			{
				breakpoint: 420,
				options: {
					maxParticles: 25,
					speed: 0.18
				}
			}
		]
	});
});

// メイン処理
window.addEventListener("load", () => {
	document.documentElement.classList.add("no-scroll");
	document.body.classList.add("no-scroll");
	const yearTag = document.getElementById("yearTag");
	if (yearTag) yearTag.textContent = new Date().getFullYear();

	const loaderOverlay = document.querySelector(".loader-overlay");
	const loaderBarFill = document.getElementById("loaderBarFill");
	const loaderPercent = document.getElementById("loaderPercent");

	// 幾何学ローディング＋アクセントタグのハロー
	if (window.mojs) {
		const loaderContainer = document.getElementById("mojsLoader");
		if (loaderContainer) {
			const spinner = new mojs.Shape({
				parent: "#mojsLoader",
				shape: "circle",
				stroke: "#009944",
				strokeDasharray: "125, 125",
				strokeDashoffset: { "0": "-125" },
				strokeWidth: 3,
				fill: "none",
				left: "50%",
				top: "50%",
				radius: 26,
				isShowStart: true,
				duration: 2000,
				easing: "cubic.out",
				repeat: 999
			});

			const polygon = new mojs.Shape({
				parent: "#mojsLoader",
				shape: "polygon",
				points: 6,
				fill: "none",
				stroke: "#666633",
				strokeWidth: 2,
				radius: { 10: 34 },
				left: "50%",
				top: "50%",
				angle: { 0: 90 },
				duration: 1800,
				isShowStart: true,
				easing: "quad.inOut",
				isYoyo: true,
				repeat: 999
			});

			const dot = new mojs.Shape({
				parent: "#mojsLoader",
				shape: "circle",
				fill: "#cc3300",
				radius: { 0: 6 },
				left: "50%",
				top: "50%",
				x: { 0: 26 },
				y: { 0: -18 },
				duration: 1200,
				easing: "sin.inOut",
				isYoyo: true,
				repeat: 999
			});

			spinner.play();
			polygon.play();
			dot.play();
		}

		// メインカード右上の YEAR END ラベルにハローを常時かける
		const accentTagEl = document.querySelector(".accent-tag");
		if (accentTagEl) {
			new mojs.Shape({
				parent: ".accent-tag",
				shape: "circle",
				fill: "none",
				stroke: "rgba(153, 153, 102, 0.8)",
				strokeWidth: 2,
				radius: { 14: 26 },
				opacity: { 0.7: 0 },
				left: "50%",
				top: "50%",
				duration: 1600,
				repeat: 999,
				easing: "quad.out"
			}).play();
		}
	}

	const startOverlay = document.querySelector(".start-overlay");
	const anglesInner = document.querySelector(".start-angles-inner");
	const startPanel = document.querySelector(".start-panel");
	const startButton = document.getElementById("startButton");
	const buttonShine = document.querySelector(".start-button .shine");
	const mainCard = document.getElementById("mainCard");
	const shards = document.querySelectorAll(".shard");
	const cardOutline = document.querySelector(".card-outline");
	const cardAngleBack = document.querySelector(".card-angle-back");
	const flash = document.querySelector(".flash");
	const sliceTop = document.querySelector(".start-slice.slice-top");
	const sliceBottom = document.querySelector(".start-slice.slice-bottom");
	const commentLayer = document.getElementById("commentLayer");
	const startBtnMinimize = document.querySelector(".start-btn-minimize");
	const startBtnMaximize = document.querySelector(".start-btn-maximize");
	const startBtnClose = document.querySelector(".start-btn-close");

	const serverOverlay = document.getElementById("serverOverlay");
	const serverBarFill = document.getElementById("serverBarFill");
	const serverPercent = document.getElementById("serverPercent");

	// 書き込みフォーム
	const threadBody = document.getElementById("threadBody");
	const postForm = document.getElementById("postForm");
	const nameInput = document.getElementById("nameInput");
	const mailInput = document.getElementById("mailInput");
	const bodyInput = document.getElementById("bodyInput");
	const postStatus = document.getElementById("postStatus");
	const postButton = document.getElementById("postButton");
	const destroyPachiButton = document.getElementById("destroyPachiButton");

	// スレ状態・フラグ
	const MAX_RES = 1000;
    let resCounter = 2;           // レス番号
	let boardDestroyed = false;   // 板崩壊中フラグ
	let commentEnabled = true;    // 通常コメント許可
	let originalThreadHtml = threadBody ? threadBody.innerHTML : "";
	let originalResCounter = resCounter;

	// 鯖落ちから復旧した直後のモード
	let postCollapseMode = false;
	let postCollapseTimeoutId = null;

	// 復旧後に自動で追加するテンプレ
	const postCollapseLogTemplates = [
		"さっきまで普通に鯖落ちてて草",
		"復旧おつ、ログ残ってて助かったわ",
		"今の落ち方、本番じゃなくてよかったな…",
		"誰だよ破壊ボタン押したやつｗ",
		"管理人さんマジおつかれさま",
		"さっき500吐いてたの見たやついる？",
		"ログ飛んでないの奇跡では",
		"復旧した瞬間にこのスレ見に来た",
		"さっきの沈黙、逆に年末感あったな",
		"今年もサーバーまで働きすぎじゃろ"
	];

	// 鯖落ちボタンは初期状態では非表示
	if (destroyPachiButton) {
		gsap.set(destroyPachiButton, { autoAlpha: 0 });
	}

	// メインカード初期状態
	gsap.set(mainCard, {
		opacity: 0,
		scale: 0.7,
		y: 40,
		rotate: -360
	});
	gsap.set([cardOutline, cardAngleBack], {
		opacity: 0,
		scale: 0.94
	});
	gsap.set([sliceTop, sliceBottom], { opacity: 0 });

	if (window.mojs && loaderOverlay) {
		gsap.set(loaderOverlay, { scale: 0.7, opacity: 0 });

		const loadBurst1 = new mojs.Burst({
			parent: loaderOverlay,
			radius: { 0: 150 },
			count: 8,
			angle: { 0: 360 },
			children: {
				shape: 'circle',
				fill: ['#009944', '#66bb66', '#666633'],
				radius: { 6: 0 },
				duration: 800,
				easing: 'cubic.out'
			}
		});

		const loadBurst2 = new mojs.Burst({
			parent: loaderOverlay,
			radius: { 0: 120 },
			count: 6,
			angle: { 0: 360 },
			children: {
				shape: 'polygon',
				points: 5,
				fill: 'none',
				stroke: ['#cc3300', '#999966'],
				strokeWidth: 2,
				radius: { 10: 0 },
				duration: 700,
				easing: 'quad.out'
			}
		});

		const loadRing = new mojs.Shape({
			parent: loaderOverlay,
			shape: 'circle',
			fill: 'none',
			stroke: '#009944',
			strokeWidth: { 3: 0 },
			radius: { 0: 180 },
			opacity: { 0.8: 0 },
			duration: 900,
			easing: 'cubic.out'
		});

		// カード表示アニメーション
		gsap.to(loaderOverlay, {
			scale: 1,
			opacity: 1,
			duration: 0.6,
			ease: 'back.out(1.7)',
			onStart: () => {
				loadBurst1.play();
				loadBurst2.play();
				loadRing.play();
			}
		});
	}

	// ローディングバー
	const loaderTl = gsap.timeline({
		onComplete: () => {
			startOverlay.style.pointerEvents = "auto";
		}
	});

	loaderTl
		.fromTo(
			loaderBarFill,
			{ width: "0%" },
			{
				width: "100%",
				duration: 1.8,
				ease: "power2.out",
				onUpdate: function () {
					const p = Math.round(this.progress() * 100);
					loaderPercent.textContent = p + "%";
				}
			}
		)
		.to(loaderOverlay, {
			opacity: 0,
			scale: 0.85,
			duration: 0.5,
			ease: "power2.out",
			delay: 0.15,
			onStart: () => {
				if (window.mojs) {
					const exitRipple = new mojs.Shape({
						parent: loaderOverlay,
						shape: 'circle',
						fill: 'none',
						stroke: '#009944',
						strokeWidth: { 2: 0 },
						radius: { 60: 180 },
						opacity: { 0.5: 0 },
						duration: 700,
						easing: 'cubic.out'
					});

					exitRipple.play();
				}
			},
			onComplete: () => {
				loaderOverlay.style.display = "none";
			}
		})
		.to(startOverlay, {
			opacity: 1,
			duration: 0.6,
			ease: "power2.out",
			onStart: () => {
				if (window.mojs && startPanel) {
					const enterBurst = new mojs.Burst({
						parent: startOverlay,
						radius: { 0: 120 },
						count: 6,
						angle: { 0: 360 },
						children: {
							shape: 'circle',
							fill: ['#009944', '#666633'],
							radius: { 5: 0 },
							duration: 800,
							easing: 'cubic.out'
						}
					});

					const enterRing = new mojs.Shape({
						parent: startOverlay,
						shape: 'circle',
						fill: 'none',
						stroke: '#009944',
						strokeWidth: { 2: 0 },
						radius: { 40: 140 },
						opacity: { 0.4: 0 },
						duration: 900,
						easing: 'quad.out'
					});

					enterBurst.play();
					enterRing.play();
				}
			}
		}, "-=0.3");

	// Enterカードアニメーション
	gsap.to(anglesInner, {
		xPercent: 10,
		duration: 6,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1
	});

	gsap.to(startPanel, {
		y: "-=10",
		duration: 1.8,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1
	});
	gsap.to(startPanel, {
		rotation: 1.4,
		duration: 3.0,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1
	});

	gsap.to(startButton, {
		scale: 1.04,
		duration: 1.3,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1
	});

	gsap.to(buttonShine, {
		xPercent: 260,
		duration: 2.2,
		ease: "power2.inOut",
		repeat: -1,
		delay: 0.4,
		repeatDelay: 1.8
	});

	// シャード常時アニメ
	shards.forEach((shard, i) => {
		gsap.fromTo(
			shard,
			{ opacity: 0, x: -30 },
			{
				opacity: 0.8,
				x: 30,
				duration: 2.0,
				ease: "sine.inOut",
				yoyo: true,
				repeat: -1,
				repeatDelay: 1.4 + i * 0.4,
				delay: i * 0.6
			}
		);
	});

	// AA コメント
	const aaList = [
		"(　´∀｀)",
		"(´・ω・`)",
		"(*´ω｀*)",
		"ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!",
		"＼(^o^)／",
		"orz",
		"( ˘ω˘ )ｽﾔｧ",
		"（＾ω＾）",
		"(ﾟдﾟ)ｳﾏｰ",
		"J('ｰ`)し",
		"ﾍ(ﾟ∀ﾟﾍ)ｱﾋｬ",
		"(･∀･)ｲｲ!!",
		"sage進行でﾏﾀｰﾘいこうぜ",
		"感謝っ・・・・!圧倒的感謝っ・・・・!",
		"あ(･∀･)り(･∀･)が(･∀･)と(･∀･)う！"
	];

	// 鯖落ち後しばらくのコメント
	const aaAfterDownList = [
		"さっき鯖落ちてたよな？",
		"復旧おつかれ",
		"ログ残ってて草",
		"鯖 生き返ったっぽい",
		"さっきまで500出てたぞ",
		"管理人ありがとうな",
		"さっきの落ち方リアルだった"
	];

	// 崩壊中に流すコメント
	const collapseCommentList = [
		"あっ",
		"落ちたなこれ",
		"鯖 逝ったわ",
		"F5連打やめろｗ",
		"復旧まだー？",
		"誰だよ破壊押したやつｗ",
		"今年もサーバーおつかれ"
	];

	function scheduleNextComment() {
		if (!commentLayer) return;
		if (!commentEnabled || boardDestroyed) return;
		const delay = 200 + Math.random() * 1000;
		setTimeout(spawnComment, delay);
	}

	function spawnComment() {
		if (!commentLayer) return;
		if (!commentEnabled || boardDestroyed) return;

		const list = postCollapseMode ? aaAfterDownList : aaList;
		const text = list[Math.floor(Math.random() * list.length)];
		const el = document.createElement("div");
		el.className = "comment-bullet";
		el.textContent = text;

		const vh = window.innerHeight;
		const top = 10 + Math.random() * Math.max(vh - 40, 40);
		el.style.top = top + "px";

		commentLayer.appendChild(el);

		const width = el.offsetWidth || 120;
		const startX = window.innerWidth + width;
		const endX = -width - 40;

		gsap.fromTo(
			el,
			{ x: startX, opacity: 0.0 },
			{
				x: endX,
				opacity: 0.95,
				duration: 8 + Math.random() * 6,
				ease: "linear",
				onComplete: () => {
					el.remove();
				}
			}
		);

		scheduleNextComment();
	}

	function spawnCollapseComment(text) {
		if (!commentLayer) return;

		const el = document.createElement("div");
		el.className = "comment-bullet";
		el.textContent = text;

		const vh = window.innerHeight;
		const top = 10 + Math.random() * Math.max(vh - 40, 40);
		el.style.top = top + "px";

		commentLayer.appendChild(el);

		const width = el.offsetWidth || 120;
		const startX = window.innerWidth + width;
		const endX = -width - 40;

		gsap.fromTo(
			el,
			{ x: startX, opacity: 0.0 },
			{
				x: endX,
				opacity: 1,
				duration: 4 + Math.random() * 3,
				ease: "linear",
				onComplete: () => {
					el.remove();
				}
			}
		);
	}

	scheduleNextComment();

	let isYukkuriAnimating = false;

	function spawnYukkuriAA() {
		if (!startPanel) return;
		if (isYukkuriAnimating) return; // 連打防止

		isYukkuriAnimating = true;

		// ゆっくり霊夢のAA
		const yukkuriAA = `　　　＿_　　 _____　　 ＿_____
　　,´　_,, '-´￣￣｀-ゝ 、_ イ、
　　'r ´　　　　　　　　　　ヽ、ﾝ、
　,'＝=─-　　　 　 -─=＝',　i
　i　ｲ　iゝ、ｲ人レ／_ルヽｲ i　|
　ﾚﾘｲi (ﾋ_] 　　 　ﾋ_ﾝ ).| .|、i .||
　　!Y!""　 ,＿__, 　 "" 「 !ﾉ i　|
　　L.',.　 　ヽ _ﾝ　　　　L」 ﾉ| .|
　　 | ||ヽ、　　　　　　 ,ｲ| ||ｲ| /
　　 レ ル｀ ー--─ ´ルﾚ　ﾚ´`;

		let overlay = startPanel.querySelector('.yukkuri-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'yukkuri-overlay';
			startPanel.appendChild(overlay);
		}

		const aaElement = document.createElement('pre');
		aaElement.className = 'yukkuri-text';
		aaElement.style.margin = '0';
		aaElement.style.padding = '0';
		aaElement.style.lineHeight = '1.2';
		aaElement.textContent = yukkuriAA;

		const panelHeight = startPanel.offsetHeight;
		const randomTop = Math.random() * Math.max(panelHeight - 200, 50);
		aaElement.style.top = randomTop + 'px';

		overlay.appendChild(aaElement);

		const width = aaElement.offsetWidth || 300;
		const startX = startPanel.offsetWidth + width;
		const endX = -width - 40;

		gsap.fromTo(
			aaElement,
			{ x: startX, opacity: 0 },
			{
				x: endX,
				opacity: 1,
				duration: 3,
				ease: "linear",
				onComplete: () => {
					aaElement.remove();
					isYukkuriAnimating = false;
				}
			}
		);
	}

	if (startBtnMinimize) {
		startBtnMinimize.addEventListener("click", (e) => {
			e.stopPropagation();
			spawnYukkuriAA();
		});
	}

	if (startBtnMaximize) {
		startBtnMaximize.addEventListener("click", (e) => {
			e.stopPropagation();
			spawnYukkuriAA();
		});
	}

	if (startBtnClose) {
		startBtnClose.addEventListener("click", (e) => {
			e.stopPropagation();
			spawnYukkuriAA();
		});
	}

	if (window.mojs && startButton) {
		startButton.addEventListener("mouseenter", () => {

			const hoverRing = new mojs.Shape({
				parent: startButton,
				shape: 'circle',
				fill: 'none',
				stroke: '#009944',
				strokeWidth: { 2: 0 },
				radius: { 20: 50 },
				opacity: { 0.6: 0 },
				duration: 500,
				easing: 'quad.out'
			});

			hoverRing.play();
		});
	}

	// Enterボタンクリックで本編表示
	startButton.addEventListener("click", () => {
		const tl = gsap.timeline();

		tl.to(startButton, {
			scale: 0.96,
			duration: 0.08,
			ease: "power2.in"
		})
		.to(startButton, {
			scale: 1.06,
			duration: 0.12,
			ease: "back.out(3)"
		});

		tl.to(flash, {
			opacity: 0.6,
			duration: 0.16,
			ease: "power2.out",
		}, "<0.02")
		.to(flash, {
			opacity: 0,
			duration: 0.3,
			ease: "power2.in"
		}, ">-0.02");

		tl.to(startPanel, {
			y: -40,
			scale: 0.9,
			opacity: 0,
			duration: 0.5,
			ease: "power2.inOut"
		}, "<0.1")
		.to(".start-angles", {
			yPercent: -80,
			opacity: 0,
			duration: 0.7,
			ease: "power3.inOut"
		}, "<0.0")
		.to(startOverlay, {
			opacity: 0,
			duration: 0.4,
			ease: "power1.out",
			onComplete: () => {
				startOverlay.style.display = "none";
			}
		}, ">-0.2");

		tl.to([cardAngleBack, cardOutline], {
			opacity: 1,
			scale: 1,
			duration: 0.6,
			ease: "back.out(1.4)"
		}, "-=0.35");

		tl.to(mainCard, {
			opacity: 1,
			scale: 1,
			y: 0,
			rotate: 0,
			duration: 0.8,
			ease: "back.out(1.8)"
		}, "-=0.45");

		tl.from(
			".eyebrow, h1, .en, .body-text, .thread-form",
			{
				opacity: 0,
				y: 16,
				duration: 0.6,
				stagger: 0.06,
				ease: "power2.out"
			},
			"-=0.4"
		);

		// メインカードのちょい揺れ
		tl.to(mainCard, {
			rotation: 1.0,
			duration: 0.08,
			yoyo: true,
			repeat: 3,
			transformOrigin: "50% 100%",
			ease: "power1.inOut"
		}, "-=0.15");

		tl.add(() => {
			document.documentElement.classList.remove("no-scroll");
			document.body.classList.remove("no-scroll");
		});

		// メインカード表示後に、鯖落ちボタンを表示
		if (destroyPachiButton) {
			tl.to(destroyPachiButton, {
				autoAlpha: 1,
				duration: 0.4,
				ease: "power2.out",
				onStart: () => {
					destroyPachiButton.style.pointerEvents = "auto";
				}
			}, "-=0.1");
		}
	});

	function isThreadFull() {
		return resCounter > MAX_RES;
	}

	function escapeHtml(str) {
		return str.replace(/[&<>"']/g, function (c) {
			return {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;"
			}[c] || c;
		});
	}

	function linkify(text) {
		const urlPattern = /(https?:\/\/[^\s<]+)/g;
		return text.replace(urlPattern, (match) => {
			return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
		});
	}

	function toZenkaku(num) {
		return String(num).replace(/[0-9]/g, d =>
			String.fromCharCode(d.charCodeAt(0) + 0xFEE0)
		);
	}

	function randomId() {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let id = "";
		for (let i = 0; i < 8; i++) {
			id += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return id;
	}

	function format2chDate() {
		const d = new Date();
		const w = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const pad = n => (n < 10 ? "0" + n : "" + n);
		const y = d.getFullYear();
		const m = pad(d.getMonth() + 1);
		const day = pad(d.getDate());
		const hh = pad(d.getHours());
		const mm = pad(d.getMinutes());
		const ss = pad(d.getSeconds());
		const ms = pad(Math.floor(Math.random() * 100));
		return `${y}/${m}/${day}(${w[d.getDay()]}) ${hh}:${mm}:${ss}.${ms}`;
	}

	function appendRes(opts) {
		if (!threadBody) return false;
		if (isThreadFull()) return false;
		if (boardDestroyed) return false;

		const name = escapeHtml(opts.name || "名無しさん＠お腹いっぱい。");
		const mail = escapeHtml(opts.mail || "");
		const rawBody = opts.body || "";

		const bodyLines = rawBody.split(/\r?\n/).map(escapeHtml);
		const bodyHtml = bodyLines
			.map(line => linkify(line))
			.join("<br>");

		const noStr = toZenkaku(resCounter);
		const idStr = randomId();
		const headerText = `${noStr} ：${name}[${mail}] 投稿日：${format2chDate()} ID:${idStr}`;

		const html =
			`<div class="res-line">` +
			`<span class="res-header">${headerText}</span><br>` +
			`${bodyHtml}` +
			`</div>`;

		threadBody.insertAdjacentHTML("beforeend", html);
		resCounter++;
		return true;
	}

	function randomAutoName() {
		const pool = [
			"名無しさん＠お腹いっぱい。",
			"Lifの中の人",
			"通りすがり",
			"某エンジニア",
			"謎のROM専"
		];
		return pool[Math.floor(Math.random() * pool.length)];
	}

	function randomAutoBody(replyToNo) {
		const n = replyToNo;

		// 鯖落ちから復旧後用テンプレ（通常投稿時・自動レス用）
		const afterDownTemplates = [
			k => `>>${k}\nさっきまで落ちてたよな？`,
			k => `>>${k}\n復旧おつかれ`,
			k => `>>${k}\nログ残ってて助かったわ`,
			k => `>>${k}\nさっき500吐いてたの草`,
			k => `>>${k}\nこの時間帯ほんと鯖弱い`,
			() => `鯖復活記念カキコ`,
			() => `さっきの落ち方リアルすぎたんだが`,
			() => `復旧した瞬間にこのスレ開いたやつ俺だけじゃないはず`,
			() => `ログ残ってるのお守り感あって好き`,
			() => `鯖さん今年もおつかれさまです`
		];

		// 通常テンプレ
		const normalTemplates = [
			// アンカー付き
			k => `>>${k}\n今年もおつかれ自分もおつかれ`,
			k => `>>${k}\nこういうのでいいんだよこういうので`,
			k => `>>${k}\n本番だけ挙動変わる現象に名前つけたいんだが`,
			k => `>>${k}\nここすき`,
			k => `>>${k}\nいいスレ立てたなオイ`,
			k => `>>${k}\n一年あっという間すぎワロエナイ`,
			k => `>>${k}\n現場のHPはもうゼロよ`,
			k => `>>${k}\nまだ戦ってるやつおる？`,
			k => `>>${k}\nとりま全員えらい`,

			// アンカー無し
			() => `今年もなんだかんだ生き延びたな…`,
			() => `とりあえず全員おつかれ、話はそれからだ`,
			() => `ここ見てるやつだいたい疲れてて草`,
			() => `年末のオフ感、嫌いじゃない`,
			() => `これ見てるやつ、今年もよくやったぞ`,
			() => `仕事納めてない勢にも優しい世界であれ`,
			() => `がんばった自覚ないけど、がんばったことにしとく`,
			() => `年末くらい自分を甘やかしていけ`,
			() => `いい意味で力の抜けたスレですこ`,
			() => `単価の話題になると急にみんな早口になるよな`,
			() => `https://ja.wikipedia.org/wiki/%E7%A0%82%E9%89%84`,
			() => `https://ja.wikipedia.org/wiki/%E6%A0%97%E9%A5%85%E9%A0%AD`,
			() => `https://ja.wikipedia.org/wiki/%E3%81%A1%E3%81%84%E3%81%8B%E3%82%8F_%E3%81%AA%E3%82%93%E3%81%8B%E5%B0%8F%E3%81%95%E3%81%8F%E3%81%A6%E3%81%8B%E3%82%8F%E3%81%84%E3%81%84%E3%82%84%E3%81%A4`,
			() => `ここまで来た時点で今年クリアでいいじゃろ`,
			() => `ちくわ大明神`
		];

		const templates = postCollapseMode ? afterDownTemplates : normalTemplates;
		const t = templates[Math.floor(Math.random() * templates.length)];
		return t(n);
	}

	function startAutoReplies(replyToNo) {
		if (boardDestroyed) return;

		const extraCount = 2 + Math.floor(Math.random() * 4); // 2〜5件
		let done = 0;

		function step() {
			if (isThreadFull() || boardDestroyed) {
				if (postStatus) {
					postStatus.textContent = "このスレッドは1000を超えました（自動レス終了）";
					setTimeout(() => {
						postStatus.textContent = "";
					}, 3000);
				}
				return;
			}

			done++;
			const body = randomAutoBody(replyToNo);
			appendRes({
				name: randomAutoName(),
				mail: "",
				body
			});

			if (postStatus) {
				postStatus.textContent = `書き込み中... (${done}/${extraCount})`;
			}

			if (done < extraCount) {
				const delay = 1000 + Math.random() * 1000; // 1〜2秒
				setTimeout(step, delay);
			} else {
				if (postStatus) {
					postStatus.textContent = "書き込み完了";
					setTimeout(() => {
						postStatus.textContent = "";
					}, 2000);
				}
			}
		}

		const firstDelay = 800 + Math.random() * 800;
		setTimeout(step, firstDelay);
	}

	if (postForm && bodyInput) {
		postForm.addEventListener("submit", (e) => {
			e.preventDefault();

			if (boardDestroyed) {
				if (postStatus) {
					postStatus.textContent = "このスレは今、復旧作業中っぽい";
					setTimeout(() => { postStatus.textContent = ""; }, 3000);
				}
				return;
			}

			if (isThreadFull()) {
				if (postStatus) {
					postStatus.textContent = "このスレッドは1000を超えたため書き込めません";
					setTimeout(() => {
						postStatus.textContent = "";
					}, 3000);
				}
				return;
			}

			const body = bodyInput.value.trim();
			if (!body) return;

			const name = (nameInput && nameInput.value.trim()) || "名無しさん＠お腹いっぱい。";
			const mail = (mailInput && mailInput.value.trim()) || "";

			const currentNo = resCounter;

			const ok = appendRes({
				name,
				mail,
				body
			});

			if (!ok) {
				if (postStatus) {
					postStatus.textContent = "このスレッドは1000を超えたため書き込めません";
					setTimeout(() => {
						postStatus.textContent = "";
					}, 3000);
				}
				return;
			}

			bodyInput.value = "";
			if (postStatus) {
				postStatus.textContent = "書き込み中...";
			}

			startAutoReplies(currentNo);
		});
	}

	function startServerRecovery() {
		// 鯖復旧中オーバーレイ表示
		if (!serverOverlay || !serverBarFill || !serverPercent) {
			restoreBoard();
			return;
		}

		serverOverlay.style.pointerEvents = "auto";
		gsap.set(serverBarFill, { width: "0%" });
		gsap.set(serverOverlay, { opacity: 0 });

		gsap.to(serverOverlay, {
			opacity: 1,
			duration: 0.4,
			ease: "power2.out"
		});

		const tl = gsap.timeline({
			onUpdate: function () {
				const p = Math.round(this.progress() * 100);
				serverPercent.textContent = p + "%";
			},
			onComplete: function () {
				gsap.to(serverOverlay, {
					opacity: 0,
					duration: 0.4,
					ease: "power2.out",
					onComplete: () => {
						serverOverlay.style.pointerEvents = "none";
						restoreBoard();
					}
				});
			}
		});

		tl.to(serverBarFill, {
			width: "100%",
			duration: 6.0,
			ease: "power2.inOut"
		});
	}

	function appendPostCollapseLogs() {
		if (!threadBody) return;
		if (isThreadFull()) return;

		// テンプレをシャッフルして先頭から2〜4件だけ使う
		const shuffled = [...postCollapseLogTemplates].sort(() => Math.random() - 0.5);
		const baseCount = 2 + Math.floor(Math.random() * 3); // 2〜4
		const count = Math.min(baseCount, shuffled.length);

		for (let i = 0; i < count; i++) {
			if (isThreadFull()) break;
			appendRes({
				name: randomAutoName(),
				mail: "",
				body: shuffled[i]
			});
		}
	}

	function restoreBoard() {
		// ログ残し復旧
		boardDestroyed = false;
		commentEnabled = true;

		// HTMLを復旧前スナップショットに戻す
		if (threadBody && originalThreadHtml) {
			threadBody.innerHTML = originalThreadHtml;
		}
		resCounter = originalResCounter;

		// 崩壊時についた transform / opacity をクリア
		gsap.set(
			[".accent-tag", ".eyebrow", "h1", ".en", ".body-text", ".body-text .res-line", ".thread-form"],
			{ clearProps: "all" }
		);

		// カード本体・枠も一度リセットしてから復旧
		gsap.set([mainCard, cardAngleBack, cardOutline], {
			opacity: 0,
			y: 40,
			scale: 0.94,
			rotation: -4
		});

		// 鯖復旧モードにしばらくする
		postCollapseMode = true;
		if (postCollapseTimeoutId) {
			clearTimeout(postCollapseTimeoutId);
		}
		postCollapseTimeoutId = setTimeout(() => {
			postCollapseMode = false;
		}, 15000);

		// 復旧直後のログをランダムでいくつか追加
		appendPostCollapseLogs();

		// 鯖復旧アニメーション
		if (threadBody) {
			const restoredLines = gsap.utils.toArray("#threadBody .res-line");

			// カード全体復旧アニメーション
			gsap.to([cardAngleBack, cardOutline], {
				opacity: 1,
				y: 0,
				scale: 1,
				rotation: 0,
				duration: 0.7,
				ease: "back.out(1.4)"
			});

			gsap.to(mainCard, {
				opacity: 1,
				y: 0,
				scale: 1,
				rotation: 0,
				duration: 0.7,
				ease: "back.out(1.6)",
				delay: 0.05
			});

			// スレ全体復旧アニメーション
			gsap.set(threadBody, { opacity: 0, y: 16 });
			if (restoredLines.length > 0) {
				gsap.set(restoredLines, { opacity: 0, y: 10 });
			}

			gsap.to(threadBody, {
				opacity: 1,
				y: 0,
				duration: 0.5,
				ease: "power2.out",
				delay: 0.15
			});

			// レスはログ復旧っぽく一行ずつ立ち上がる
			if (restoredLines.length > 0) {
				gsap.to(restoredLines, {
					opacity: 1,
					y: 0,
					duration: 0.45,
					stagger: 0.035,
					ease: "power2.out",
					delay: 0.25
				});
			}
		}

		// 入力系復旧
		if (bodyInput) bodyInput.disabled = false;
		if (nameInput) nameInput.disabled = false;
		if (mailInput) mailInput.disabled = false;
		if (postButton) postButton.disabled = false;

		// 鯖落ちボタン復旧アニメーション
		if (destroyPachiButton) {
			destroyPachiButton.classList.remove("pachi-destroy-disabled");
			gsap.to(destroyPachiButton, {
				autoAlpha: 1,
				duration: 0.4,
				ease: "power2.out",
				delay: 0.3,
				onStart: () => {
					destroyPachiButton.style.pointerEvents = "auto";
				}
			});
		}

		// コメントも再開
		scheduleNextComment();

		if (postStatus) {
			postStatus.textContent = "";
		}
	}

	function startBoardCollapse() {
		if (boardDestroyed) return;

		// 鯖落ち時のログを保存（ログ残し復旧用）
		if (threadBody) {
			originalThreadHtml = threadBody.innerHTML;
		}
		originalResCounter = resCounter;

		// 入力系封印
		if (bodyInput) bodyInput.disabled = true;
		if (nameInput) nameInput.disabled = true;
		if (mailInput) mailInput.disabled = true;
		if (postButton) postButton.disabled = true;

		// 鯖落ちボタンはサーバー落ち中は非表示＋無効化
		if (destroyPachiButton) {
			destroyPachiButton.classList.add("pachi-destroy-disabled");
			destroyPachiButton.style.pointerEvents = "none";
			gsap.to(destroyPachiButton, {
				autoAlpha: 0,
				duration: 0.2,
				ease: "power2.out"
			});
		}

		if (postStatus) {
			postStatus.textContent = "板が崩壊していく…";
		}

		// 鯖落壊状態
		boardDestroyed = true;
		commentEnabled = false;

		// 崩壊コメントをしばらく垂れ流す
		for (let i = 0; i < 10; i++) {
			setTimeout(() => {
				const text = collapseCommentList[Math.floor(Math.random() * collapseCommentList.length)];
				spawnCollapseComment(text);
			}, 250 * i);
		}

		// 板崩壊アニメーション対象
		const lines = gsap.utils.toArray(
			".accent-tag, .eyebrow, h1, .en, .body-text, .body-text .res-line, .thread-form"
		);

		// カード崩壊アニメーション
		gsap.to(mainCard, {
			scale: 1.06,
			rotation: 4,
			y: -18,
			duration: 0.2,
			ease: "power2.inOut",
			yoyo: true,
			repeat: 1
		});

	// 文字の崩れ＆暗転アニメーション
	gsap.to(lines, {
		y: () => 160 + Math.random() * 200,
		x: () => -140 + Math.random() * 280,
		rotation: () => -50 + Math.random() * 100,
		scale: () => 0.7 + Math.random() * 0.25,
		opacity: 0,
		stagger: 0.035,
		duration: 1.2,
		ease: "back.in(2.1)",
		onComplete: () => {
			if (postStatus) {
				postStatus.textContent = "";
			}
		}
	});

	const shellParts = [mainCard, cardAngleBack, cardOutline];

	gsap.to(shellParts, {
		y: 180,
		rotation: () => -10 + Math.random() * 20,
		scale: 0.9,
		opacity: 0,
		stagger: { each: 0.05, from: "center" },
		duration: 0.8,
		ease: "power2.in",
		delay: 0.8,
		onComplete: () => {
			// すべて崩壊しきってから暗転
			setTimeout(() => {
				startServerRecovery();
			}, 500);
		}
	});
}

	// 鯖落ちボタン
	if (destroyPachiButton) {
		destroyPachiButton.addEventListener("click", () => {
			if (bodyInput) bodyInput.blur();
			startBoardCollapse();
		});
	}
});

