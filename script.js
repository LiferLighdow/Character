
        // 全局狀態變數
        let currentActiveBookButton = null;
        let currentActiveCharacterButton = null;
        let isSidebarOpen = false; // 側邊欄狀態

        // 獲取 DOM 元素
        const sidebarToggle = document.getElementById('sidebarToggle');
        const closeSidebarButton = document.getElementById('closeSidebarButton'); // 新增的關閉按鈕
        const characterListPanel = document.getElementById('characterListPanel');
        const mainContentWrapper = document.getElementById('mainContentWrapper');
        const bookCategorySectionsDiv = document.getElementById('bookCategorySections'); // 新的書別區塊容器
        const characterSelectionHeader = document.getElementById('characterSelectionHeader'); // 角色選擇標題
        const characterButtonsContainer = document.getElementById('characterButtonsContainer');
        const characterDetailsContainer = document.getElementById('characterDetailsContainer');
        const initialMessage = document.getElementById('initialMessage');

        // 側邊欄開關功能
        function toggleSidebar() {
            isSidebarOpen = !isSidebarOpen;
            updateLayout();
            if (isSidebarOpen) {
                sidebarToggle.classList.add('hidden'); // 隱藏打開按鈕
                closeSidebarButton.classList.remove('hidden'); // 顯示關閉按鈕
            } else {
                sidebarToggle.classList.remove('hidden'); // 顯示打開按鈕
                closeSidebarButton.classList.add('hidden'); // 隱藏關閉按鈕
            }
        }

        // 根據側邊欄狀態更新佈局
        function updateLayout() {
            if (isSidebarOpen) {
                characterListPanel.classList.remove('-translate-x-full');
                characterListPanel.classList.add('translate-x-0');
                // 桌面版時主內容區偏移
                if (window.innerWidth >= 1024) { // lg breakpoint
                    mainContentWrapper.style.marginLeft = (window.innerWidth >= 1280) ? '288px' : '256px'; // w-72 or w-64
                    mainContentWrapper.classList.add('sidebar-open'); // 添加類別用於調整 padding
                } else { // 行動版不偏移
                    mainContentWrapper.style.marginLeft = '0';
                    mainContentWrapper.classList.remove('sidebar-open');
                }
            } else {
                characterListPanel.classList.remove('translate-x-0');
                characterListPanel.classList.add('-translate-x-full');
                mainContentWrapper.style.marginLeft = '0'; // 側邊欄關閉時，主內容區歸位
                mainContentWrapper.classList.remove('sidebar-open');
            }
        }

        // 事件監聽器
        sidebarToggle.addEventListener('click', toggleSidebar);
        closeSidebarButton.addEventListener('click', toggleSidebar); // 關閉按鈕也觸發 toggleSidebar

        window.addEventListener('resize', () => {
            // 視窗大小改變時，重新評估側邊欄狀態
            if (window.innerWidth < 1024) { // 小於 lg 尺寸時，強制側邊欄關閉
                if (isSidebarOpen) { // 如果當前是開啟狀態，則關閉
                    isSidebarOpen = false;
                }
            } else { // 大於等於 lg 尺寸時，強制側邊欄開啟
                if (!isSidebarOpen) {
                    isSidebarOpen = true;
                }
            }
            updateLayout(); // 應用新的佈局
        });

        // 初始載入時設定側邊欄狀態
        window.addEventListener('DOMContentLoaded', () => {
            if (window.innerWidth >= 1024) {
                isSidebarOpen = true; // 桌面版預設開啟
                sidebarToggle.classList.add('hidden'); // 桌面版初始隱藏打開按鈕
                closeSidebarButton.classList.remove('hidden'); // 桌面版初始顯示關閉按鈕
            } else {
                isSidebarOpen = false; // 行動版預設關閉
                sidebarToggle.classList.remove('hidden'); // 行動版初始顯示打開按鈕
                closeSidebarButton.classList.add('hidden'); // 行動版初始隱藏關閉按鈕
            }
            updateLayout(); // 應用初始佈局
            animate(); // 開始粒子動畫
            createBookCategorySections(); // 創建書別類別區塊

            // 角色選擇區塊的收合邏輯
            characterSelectionHeader.addEventListener('click', () => {
                characterButtonsContainer.classList.toggle('expanded');
                const svg = characterSelectionHeader.querySelector('svg');
                if (svg) { // 確保 SVG 存在
                    svg.classList.toggle('rotate-180'); // 箭頭旋轉
                }
            });
            // 預設展開角色選擇區塊
            characterButtonsContainer.classList.add('expanded');
            const characterSelectionSvg = characterSelectionHeader.querySelector('svg');
            if (characterSelectionSvg) {
                characterSelectionSvg.classList.add('rotate-180');
            }
        });

        // 創建書別類別區塊 (大作品/小作品) 和其下的書名按鈕
        function createBookCategorySections() {
            bookCategorySectionsDiv.innerHTML = ''; // 清空舊內容

            for (const categoryName in bookData) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'mb-4';

                const headerButton = document.createElement('button');
                headerButton.textContent = categoryName;
                headerButton.className = 'w-full text-left px-4 py-3 rounded-xl font-bold text-xl flex justify-between items-center button-holographic collapsible-header';
                headerButton.innerHTML = `${categoryName} <svg class="w-5 h-5 ml-2 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
                categoryDiv.appendChild(headerButton);

                const contentDiv = document.createElement('div');
                contentDiv.className = 'collapsible-content space-y-2 px-2 expanded'; // 內縮一點，預設展開
                categoryDiv.appendChild(contentDiv);

                // 填充書名按鈕
                bookData[categoryName].forEach(book => {
                    const bookButton = document.createElement('button');
                    bookButton.textContent = book.name;
                    bookButton.dataset.bookName = book.name;
                    bookButton.className = 'block w-full text-left px-4 py-2 rounded-lg text-sm book-button';
                    contentDiv.appendChild(bookButton);

                    bookButton.addEventListener('click', () => {
                        // 移除之前選中書名按鈕的樣式
                        if (currentActiveBookButton) {
                            currentActiveBookButton.classList.remove('active');
                        }
                        // 添加當前選中書名按鈕的樣式
                        bookButton.classList.add('active');
                        currentActiveBookButton = bookButton;

                        // 填充左側角色列表
                        populateCharacterList(book.characters);

                        // 清空右側詳細資訊並顯示提示
                        characterDetailsContainer.classList.add('hidden');
                        initialMessage.textContent = `請從左側列表選擇一個 ${book.name} 的角色。`;
                        initialMessage.classList.remove('hidden');

                        // 在小螢幕上，選擇書名後自動隱藏側邊欄
                        if (window.innerWidth < 1024 && isSidebarOpen) {
                            toggleSidebar();
                        }
                    });
                });

                // 可收合邏輯
                headerButton.addEventListener('click', () => {
                    contentDiv.classList.toggle('expanded');
                    const svg = headerButton.querySelector('svg');
                    svg.classList.toggle('rotate-180'); // 箭頭旋轉
                });

                bookCategorySectionsDiv.appendChild(categoryDiv);
            }
        }

        // 填充左側角色列表面板
        function populateCharacterList(characters) {
            characterButtonsContainer.innerHTML = ''; // 清空舊的角色按鈕
            currentActiveCharacterButton = null; // 重置選中的角色按鈕

            if (characters && characters.length > 0) {
                characters.forEach(character => {
                    const characterButton = document.createElement('button');
                    characterButton.textContent = character['角色名稱'];
                    characterButton.dataset.characterName = character['角色名稱'];
                    characterButton.className = 'block w-full text-left px-4 py-2 rounded-lg transition duration-200 ' +
                                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 character-list-button'; /* 添加角色列表按鈕樣式 */
                    characterButtonsContainer.appendChild(characterButton);

                    characterButton.addEventListener('click', () => {
                        // 移除之前選中角色按鈕的樣式
                        if (currentActiveCharacterButton) {
                            currentActiveCharacterButton.classList.remove('active');
                        }

                        // 添加當前選中角色按鈕的樣式
                        characterButton.classList.add('active');
                        currentActiveCharacterButton = characterButton;

                        displayCharacterDetails(character); // 顯示選中角色的詳細資訊
                    });
                });
            } else {
                characterButtonsContainer.innerHTML = `<p class="text-gray-400 text-sm">此書別暫無角色數據。</p>`;
            }
        }

        // 顯示單一角色詳細資訊
        function displayCharacterDetails(character) {
            characterDetailsContainer.innerHTML = ''; // 清空舊內容
            initialMessage.classList.add('hidden'); // 隱藏初始提示

            // 角色圖片容器，確保圖片置中
            const imageContainer = document.createElement('div');
            imageContainer.className = 'flex justify-center mb-6'; // flexbox 居中

            const img = document.createElement('img');
            img.src = character.imageUrl;
            img.alt = character['角色名稱'];
            // 圖片樣式：方形邊框，發光效果
            img.className = 'w-48 h-96 object-cover rounded-lg shadow-xl image-projection transition duration-300 hover:scale-105';
            img.onerror = function() {
                this.onerror=null;
                this.src='https://placehold.co/200x400/6B7280/FFFFFF?text=No+Image%0AFull+Body'; // Fallback image
            };
            imageContainer.appendChild(img);
            characterDetailsContainer.appendChild(imageContainer); // 將包含圖片的容器添加到浮窗

            const title = document.createElement('h2');
            title.className = 'text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 mb-6 text-center drop-shadow-lg';
            title.textContent = `${character['角色名稱']} 分析`;
            characterDetailsContainer.appendChild(title);

            const contentDiv = document.createElement('div');
            // 將 text-sm 調整為 text-base (或更大，例如 text-lg) 以增大字體
            contentDiv.className = 'space-y-4 text-blue-200 w-full text-left text-base'; /* 淺藍色文字，字體增大 */

            for (const key in character) {
                if (Object.hasOwnProperty.call(character, key) && key !== 'imageUrl' && key !== '角色名稱') {
                    const value = character[key];

                    const detailDiv = document.createElement('div');
                    // 移除背景色和陰影，使其更像漂浮的文字
                    detailDiv.className = 'p-3 rounded-lg'; /* 僅保留 padding 和圓角 */

                    const h3 = document.createElement('h3');
                    // 將 text-lg 調整為 text-xl (或更大) 以增大標題字體
                    h3.className = 'text-xl font-semibold text-blue-300 mb-1';
                    h3.textContent = key;
                    detailDiv.appendChild(h3);

                    if (Array.isArray(value)) {
                        const ul = document.createElement('ul');
                        // 將 text-sm 調整為 text-base (或更大，例如 text-lg) 以增大列表項字體
                        ul.className = 'list-disc list-inside space-y-0.5 text-base';
                        value.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item;
                            ul.appendChild(li);
                        });
                        detailDiv.appendChild(ul);
                    } else {
                        const p = document.createElement('p');
                        // 將 text-sm 調整為 text-base (或更大，例如 text-lg) 以增大段落字體
                        p.className = 'text-blue-200 leading-relaxed text-base whitespace-pre-wrap'; /* 淺藍色文字，字體增大 */
                        p.textContent = value;
                        detailDiv.appendChild(p);
                    }
                    contentDiv.appendChild(detailDiv);
                }
            }
            characterDetailsContainer.appendChild(contentDiv);
            characterDetailsContainer.classList.remove('hidden');
            // 每次顯示時重新應用動畫，確保動態感
            characterDetailsContainer.classList.remove('animate-fade-in-scale');
            void characterDetailsContainer.offsetWidth; // 觸發重繪
            characterDetailsContainer.classList.add('animate-fade-in-scale');
        }

        // 粒子動畫效果
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // 設置畫布尺寸以適應父容器
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // 初始設置尺寸

        const particles = [];
        const numParticles = 500; // 進一步增加粒子數量，更密集

        // 粒子類
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2.5 + 0.5; // 粒子大小範圍
                this.speedX = Math.random() * 2 - 1; // 稍微增加速度
                this.speedY = Math.random() * 2 - 1;
                // 增加粒子透明度，使其更明顯
                this.color = `rgba(100, 200, 255, ${Math.random() * 0.4 + 0.15})`; /* 增加粒子透明度 */
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // 粒子超出邊界時重新定位
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 初始化粒子
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }

        // 動畫循環
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // 繪製粒子之間的連線
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 300) { // 進一步增加連線距離
                        // 增加連線透明度，使其更明顯
                        ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 - (distance / 300)})`; /* 增加連線透明度 */
                        ctx.lineWidth = 1.1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
