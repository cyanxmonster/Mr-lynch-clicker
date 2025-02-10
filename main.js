function detect(image, sound) {
    const audio = new Audio(sound);
    const elements = document.body.children;
    while (elements.length > 0) {
        elements[0].remove();
    }
    audio.play();
    Object.assign(document.body.style, {
        margin: '0',
        height: '100vh',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    });
}

document.addEventListener('contextmenu', e => e.preventDefault());

window.detect = detect;
let ginput = document.createElement("input")
    ginput.value = 10
    ginput.id = 'gambleAmount'
    ginput.type = 'number'
    ginput.min = '10'
document.addEventListener('DOMContentLoaded', () => {
    const gameConfig = {
        points: 0,
        pointsPerClick: 1,
        socialCredit: 0,
        pointsPerSecond: 0,
        upgrades: [
            { id: "upgrade1", name: "+1 per click", cost: 10, isUpgraded: false, effect: game => game.pointsPerClick++ },
            { id: "autoclicker", level: 1, name: "Auto Clicker", cost: 100, isActive: false, interval: null, isUpgraded: false, effect: function(game) {
                if (!this.isActive) {
                    this.isActive = true;
                    this.interval = setInterval(() => {
                        game.points += game.pointsPerSecond;
                        updateDisplay();
                    }, 1000);
                }
                this.level += 1;
                game.pointsPerSecond++;
                this.name = `Auto Clicker Lv ${this.level.toLocaleString()}`;
                document.getElementById("pps").style.display = 'inline';
            }},
            { id: 'king von', name: 'super duper fast autoclicker that totally doesnt do anything suspicious', cost: 1000, prerequisite: 'autoclicker', hidden: true, effect: () => detect("kvap.jpg", "sound.mp3") },
            { id: 'gamble', name: 'gamble mr lynches', cost: ginput.value, effect: function(game) { openCase(ginput.value); this.cost = ginput.value; }},
			{ id: 'skip', name: 'case skip button', cost: 5000, noupgrade: false, effect: () => skippable = true },
            { id: 'china', name: 'social credit (useless)', cost: 1, effect: game => { game.socialCredit++; document.getElementById("socialcredits").style.display = 'inline'; }}
        ]
    };
    if (gameConfig.points < 10){
        ginput.disabled = true;
    }
    ginput.max = gameConfig.points;
    const elements = {
        graybg: document.getElementById("graybg"),
        pointsDisplay: document.getElementById("points"),
        clickButton: document.getElementById("clickButton"),
        upgradesContainer: document.getElementById("upgrades"),
        ppcDisplay: document.getElementById("ppc"),
        scDisplay: document.getElementById("socialcredits"),
        ppsDisplay: document.getElementById("pps"),
        cardList: document.getElementById('cardList'),
        skipButton: document.getElementById('skipButton'),
        unbox: document.getElementById("unbox-area"),
        menu: document.querySelector(".menu"),
        menuIcon: document.querySelector(".menu-icon"),
        saveButton: document.getElementById('saveButton'),
        loadButton: document.getElementById('loadButton'),
        deleteButton: document.getElementById('deleteButton')
    };
    
    let skippable = false;

    function updateDisplay() {
        elements.pointsDisplay.textContent = `mr lynchs: ${gameConfig.points.toLocaleString()}`;
        elements.ppcDisplay.textContent = `mr lynchs per click: ${gameConfig.pointsPerClick.toLocaleString()}`;
        elements.scDisplay.textContent = `social credit: ${gameConfig.socialCredit.toLocaleString()}`;
        elements.ppsDisplay.textContent = `mr lynches per second: ${gameConfig.pointsPerSecond.toLocaleString()}`;
        gameConfig.upgrades.forEach(upgrade => {
            const button = document.getElementById(upgrade.id);
            if (button) {
                button.disabled = gameConfig.points < upgrade.cost || upgrade.noupgrade;
                button.innerHTML = `${upgrade.name}<br>(Cost: ${upgrade.cost.toLocaleString()})`;
                if (upgrade.noupgrade) button.innerHTML = `${upgrade.name}<br>(Bought)`;
            }
        });
        document.getElementById("gamble").insertAdjacentElement('afterend',ginput);
        if (gameConfig.socialCredit >= 15) {
            detect("sc.png", "sc.mp3");
            gameConfig.socialCredit--;
        }
        if (gameConfig.points < 10){
            ginput.disabled = true;
        }
        else {
            ginput.disabled = false;
        }
    }

    function initializeUpgrades() {
        elements.upgradesContainer.innerHTML = "";
        gameConfig.upgrades.forEach(upgrade => {
            if (upgrade.hidden) return;
            const button = document.createElement("button");
            button.id = upgrade.id;
            button.innerHTML = `${upgrade.name}<br>(Cost: ${upgrade.cost.toLocaleString()})`;
            if (upgrade.noupgrade) {
                button.disabled = true;
                button.innerHTML = `${upgrade.name}<br>(Bought)`;
            } else {
                button.disabled = gameConfig.points < upgrade.cost;
            }
            if (upgrade.prerequisite) {
                const prerequisite = gameConfig.upgrades.find(u => u.id === upgrade.prerequisite);
                if (prerequisite && prerequisite.hidden) {
                    prerequisite.hidden = false;
                    initializeUpgrades();
                }
            }
            button.addEventListener("click", (event) => {
                if (gameConfig.points >= upgrade.cost) {
                    gameConfig.points -= upgrade.cost;
                    upgrade.cost = Math.floor(upgrade.cost * 1.5);
                    button.innerHTML = `${upgrade.name}<br>(Cost: ${upgrade.cost.toLocaleString()})`;
                    if (upgrade.hasOwnProperty("noupgrade")) upgrade.noupgrade = true;
                    if (upgrade.effect) upgrade.effect(gameConfig);
                    gameConfig.upgrades.forEach(hiddenUpgrade => {
                        if (hiddenUpgrade.hidden && hiddenUpgrade.prerequisite === upgrade.id) {
                            hiddenUpgrade.hidden = false;
                            initializeUpgrades();
                        }
                    });
                    updateDisplay();
                }
            });
            elements.upgradesContainer.appendChild(button);
        });
    }
    function saveGame() {
        localStorage.setItem("gameConfig", JSON.stringify(gameConfig));
        alert("Game saved!");
    }

    function loadGame() {
        const savedConfig = localStorage.getItem("gameConfig");
        if (savedConfig) {
            const gameState = JSON.parse(savedConfig);
            gameConfig.points = gameState.points || 0;
            gameConfig.pointsPerClick = gameState.pointsPerClick || 1;
			gameConfig.pointsPerSecond = savedConfig.pointsPerSecond || 0;
			gameConfig.socialCredit = savedConfig.socialCredit || 0;
            gameConfig.upgrades.forEach(upgrade => {
                const savedUpgrade = gameState.upgrades.find(u => u.id === upgrade.id);
                if (savedUpgrade) {
                    Object.assign(upgrade, savedUpgrade);
                    if (upgrade.isActive && upgrade.effect || upgrade.noupgrade && upgrade.effect) upgrade.effect(gameConfig);
                    if (upgrade.id === "autoclicker" && upgrade.isActive) {
                        clearInterval(upgrade.interval);
                        upgrade.interval = setInterval(() => {
                            gameConfig.points += gameConfig.pointsPerSecond;
                            updateDisplay();
                        }, 1000);
                    }
                }
            });
            alert("Game loaded!");
            updateDisplay();
        } else alert("No saved game found.");
    }
    const itemIcons = {
        common: '<img width="100" height="100"src="x0.5.jpg">',
        uncommon: '<img width="100" height="100"src="x1.1.jpg">',
        rare: '<img width="100" height="100"src="x1.5.jpg">',
        epic: '<img width="100" height="100"src="x2.jpg">',
        legendary: '<img width="100" height="100"src="x10.jpg">'
    };

    function resetCase() {
		elements.cardList.innerHTML = '';
		for (let i = 0; i < 210; i++) {
			const rand = Math.random() * 1000;
			let rarity, item;
            if (rand <= 0.1) {alert("rare event! there is a 0.1% chance of this happening!");deleteSave();rand = 100000}
			if (rand < 10) { rarity = 10; item = itemIcons.legendary; }
			else if (rand < 50) { rarity = 2; item = itemIcons.epic; }
			else if (rand < 100) { rarity = 1.5; item = itemIcons.rare; }
			else if (rand < 500) { rarity = 1.1; item = itemIcons.uncommon; }
			else { rarity = 0.5; item = itemIcons.common; }
			const element = `<div class="card" style="background-color: white;" data-rarity="${rarity}" id="itemNumber${i}">${item}</div>`;
			elements.cardList.insertAdjacentHTML('beforeend', element);
		}
		document.querySelector('.card').style.marginLeft = '-1000px';
	}
	function handleCaseAnimation(reward, card, rand) {
		let awarded = false;
		const cardAnimation = card.animate(
			[
				{ marginLeft: '0px' },
				{ marginLeft: `-${rand}px` }
			],
			{
				duration: 5000,
				easing: "cubic-bezier(.4,0,.3,1)",
				fill: 'forwards'
			}
		);
		if (skippable) elements.skipButton.style.display = 'block';
		elements.skipButton.addEventListener('click', () => {
			if (awarded) return;
			cardAnimation.pause();
			card.style.marginLeft = `-${rand}px`;
			awardReward(reward);
			awarded = true;
		});
		cardAnimation.onfinish = () => {
			if (awarded) return;
			awardReward(reward);
			awarded = true;
		};
	}
	function awardReward(reward) {
		alert(`You have received ${parseInt(reward)} mr lynches`);
		gameConfig.points += parseInt(reward);
		elements.unbox.style.display = 'none';
		elements.graybg.style.display = 'none';
		elements.skipButton.style.display = 'none';
		updateDisplay();
	}
	function openCase(amount) {
		elements.unbox.style.display = 'block';
		elements.graybg.style.display = 'block';
		resetCase();
		const rand = Math.floor(Math.random() * 20000) + 1000;
		const childNumber = Math.floor(rand / 100) + 4;
		const reward = document.querySelector(`#itemNumber${childNumber}`).getAttribute('data-rarity') * amount;
		const card = document.querySelector('.card');
	
		handleCaseAnimation(reward, card, rand);
	}

    function deleteSave() {
        localStorage.removeItem("gameConfig");
        alert("Game data deleted!");
        window.location.reload();
        updateDisplay();
    }

    (function() {
        function resolver(e, i) {
            const game = gameConfig;
            const gameState = game.upgrades.find(upgrade => upgrade.id === "autoclicker");
            if (gameState) {
                clearInterval(gameState.interval);
                gameState.interval = setInterval(() => {
                    game.points += gameState.level - 1;
                    updateDisplay();
                }, i);
                for (let i = 0; i < e; i++) {
                    gameState.effect(game);
                    game.pointsPerClick += 1;
                }
                gameState.cost = 0;
                updateDisplay();
            }
        }
        window.resolver = resolver;
    })();

    function gameRoutine() {
        detect("troll.gif", "phonk.mp3");
    }
    window.gameRoutine = gameRoutine;

    elements.graybg.addEventListener("click", event => event.stopPropagation());

    let cursorX, cursorY;
    document.addEventListener("mousemove", event => {
        cursorX = event.clientX;
        cursorY = event.clientY;
    });

    function handleClick() {
        gameConfig.points += gameConfig.pointsPerClick;
        updateDisplay();
        const element = elements.clickButton.cloneNode();
        element.classList.add("bounce");
        element.style.left = `${cursorX-90}px`;
        element.style.top = `${cursorY-90}px`;
        document.body.appendChild(element);
        element.addEventListener("animationend", () => element.remove());
    }

    elements.clickButton.addEventListener("click", handleClick);

    const clickSound = new Audio('click.mp3');
    document.addEventListener("keyup", event => {
        if (event.code === "Space") {
            handleClick();
            clickSound.cloneNode().play();
            elements.clickButton.style.transform = 'scale(1)';
        }
    });

    document.addEventListener("keydown", event => {
        if (event.code === "Space") {
            event.preventDefault();
            elements.clickButton.style.transform = 'scale(0.8)';
        }
    });
    ginput.addEventListener("change", function (){
        console.log(ginput.value)
        ginput.max = gameConfig.points
        gameConfig.upgrades.forEach((upgrade) => {
            if(upgrade.id == 'gamble'){
                upgrade.cost = ginput.value;
                upgrade.effect = function () {
                    openCase(ginput.value);
                    this.cost = ginput.value;
                }
            }
        })
        updateDisplay();
    })
    elements.menuIcon.addEventListener("click", () => elements.menu.classList.toggle("active"));

    let clickTimes = [];
    const detectionThreshold = 7;
    const detectionInterval = 500;
    document.addEventListener('click', () => {
        const now = Date.now();
        clickTimes.push(now);
        clickTimes = clickTimes.filter(time => now - time <= detectionInterval);
        if (clickTimes.length > detectionThreshold) detect('kvap.jpg', 'sound.mp3');
        document.getElementById("sorry").style.display = 'none';
    });

    elements.saveButton.addEventListener('click', saveGame);
    elements.loadButton.addEventListener('click', loadGame);
    elements.deleteButton.addEventListener('click', deleteSave);

    initializeUpgrades();
    updateDisplay();
    
});