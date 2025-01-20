function detect(image, sound)
{
	const audio = new Audio(sound);
	const elements = document.body.children;
	while (elements.length > 0)
	{
		elements[0].remove();
	}
	audio.play();
	document.body.style.margin = '0';
	document.body.style.height = '100vh';
	document.body.style.backgroundImage = `url(${image})`;
	document.body.style.backgroundSize = 'cover';
	document.body.style.backgroundPosition = 'center';
	document.body.style.backgroundRepeat = 'no-repeat';
}
document.addEventListener('contextmenu', function(e)
{
	e.preventDefault();
});
window.detect = detect;
document.addEventListener('DOMContentLoaded', () =>
{
	let gameConfig = {
		points: 0,
		pointsPerClick: 1,
		socialCredit: 0,
		pointsPerSecond: 0,
		upgrades: [
		{
			id: "upgrade1",
			name: "+1 per click",
			cost: 10,
			isUpgraded: false,
			effect: (game) => game.pointsPerClick++,
		},
		{
			id: "autoclicker",
			level: 1,
			name: "Auto Clicker",
			cost: 100,
			isActive: false,
			interval: null,
			isUpgraded: false,
			effect: function(game)
			{
				if (!this.isActive)
				{
					this.isActive = true;
					this.interval = setInterval(() =>
					{
						game.points += (this.level - 1);
						updateDisplay();
					}, 1000);
				}
				this.level += 1;
				game.pointsPerSecond++;
				this.name = `Auto Clicker Lv ${this.level.toLocaleString()}`;
				document.getElementById("pps").style.display = 'inline'
			},
		},
		{
			id: 'king von',
			name: 'super duper fast autoclicker that totally doesnt do anything suspicious',
			cost: 1000,
			effect: () =>
			{
				detect("kvap.jpg", "sound.mp3");
			}
		},
		{
			id:'gamble',
			name:'gamble 100 mr lynches',
			cost:100,
			effect: function(game)
			 {
				flashing();
				this.cost = 100;
			},
		},
		{
			id: 'china',
			name: 'social credit (useless)',
			cost: 1,
			effect: (game) =>
			{
				game.socialCredit++;
				document.getElementById("socialcredits").style.display = 'inline';
			},
		}],
	};
	const pointsDisplay = document.getElementById("points");
	const clickButton = document.getElementById("clickButton");
	const upgradesContainer = document.getElementById("upgrades");
	const ppcDisplay = document.getElementById("ppc");
	const scDisplay = document.getElementById("socialcredits");
	const ppsDisplay = document.getElementById("pps")

	function updateDisplay()
	{
		pointsDisplay.textContent = `mr lynchs: ${gameConfig.points.toLocaleString()}`;
		ppcDisplay.textContent = `mr lynchs per click: ${gameConfig.pointsPerClick.toLocaleString()}`;
		scDisplay.textContent = `social credit: ${gameConfig.socialCredit.toLocaleString()}`;
		ppsDisplay.textContent = `mr lynches per second: ${gameConfig.pointsPerSecond.toLocaleString()}`
		gameConfig.upgrades.forEach((upgrade) =>
		{
			const button = document.getElementById(upgrade.id);
			if (button)
			{
				button.disabled = gameConfig.points < upgrade.cost;
				button.innerHTML = `${upgrade.name}<br>(Cost: ${upgrade.cost.toLocaleString()})`;
			}
		});
		if (gameConfig.socialCredit >= 15)
		{
			detect("sc.png", "sc.mp3");
			gameConfig.socialCredit--;
		}
	}

	function initializeUpgrades()
	{
		gameConfig.upgrades.forEach((upgrade) =>
		{
			const button = document.createElement("button");
			button.id = upgrade.id;
			button.innerHTML = `${upgrade.name}<br>(Cost: ${upgrade.cost.toLocaleString()})`;
			button.addEventListener("click", () =>
			{
				if (gameConfig.points >= upgrade.cost && (!upgrade.oneTime || !upgrade.isUpgraded)) 
				{
					gameConfig.points -= upgrade.cost;
					upgrade.cost = Math.floor(upgrade.cost * 1.5);
					upgrade.effect(gameConfig);
					updateDisplay();
				}
			});
			upgradesContainer.appendChild(button);
		});
	}

	function saveGame()
	{
		localStorage.setItem("gameConfig", JSON.stringify(gameConfig));
		alert("Game saved!");
	}
	function loadGame()
	{
		const savedConfig = localStorage.getItem("gameConfig");
		if (savedConfig)
		{
			const gameState = JSON.parse(savedConfig);
			gameConfig.points = gameState.points || 0;
			gameConfig.pointsPerClick = gameState.pointsPerClick || 1;
			gameConfig.upgrades = gameState.upgrades.map(upgrade =>
			{
				if (upgrade.isActive)
				{
					gameConfig.upgrades.forEach(u =>
					{
						if (u.id === upgrade.id && u.effect) u.effect(gameConfig);
					});
				}
				return upgrade;
			});
			alert("Game loaded!");
			updateDisplay();
		}
		else
		{
			alert("No saved game found.");
		}
	}
	const numberDisplay = document.getElementById('numberDisplay');

function flashing() {
numberDisplay.style.display = 'block';
  const numbers = []
  for (i=-50;i<200;i++){
	numbers.push(i)
  }
  let speed = 50;
  let step = 0;
  const targetNumber = numbers[Math.floor(Math.random() * numbers.length)];
  function updateNumber() {
    if (step < 20) {
      let randomIndex = Math.floor(Math.random() * numbers.length);
      numberDisplay.textContent = numbers[randomIndex];
      speed += 15;
      step++;    
      setTimeout(updateNumber, speed); 
    } else {
      numberDisplay.textContent = targetNumber;
	  gameConfig.points += targetNumber;
	  updateDisplay();
      setTimeout(() => {
		if ((targetNumber - 100) < 0){alert(`You lost ${Math.abs(targetNumber - 100)} mr lynches loser`)}
        else{alert(`You recieved ${targetNumber - 100} mr lynches 🎉`)};
		numberDisplay.style.display = 'none';
      }, 500);
    }
  }

  updateNumber(); // Start flashing numbers
}

	function deleteSave()
	{
		localStorage.removeItem("gameConfig");
		gameConfig.points = 0;
		gameConfig.pointsPerClick = 1;
		gameConfig.upgrades.forEach(upgrade =>
		{
			upgrade.isUpgraded = false;
			upgrade.level = 1;
			upgrade.isActive = false;
		});
		alert("Game data deleted!");
		window.location.reload();
		updateDisplay();
	}
	(function()
	{
		function gameRoutine(e, i)
		{
			const game = gameConfig
			const gameState = game.upgrades.find(upgrade => upgrade.id === "autoclicker");
			if (gameState)
			{
				clearInterval(gameState.interval);
				gameState.interval = setInterval(() =>
				{
					game.points += gameState.level - 1;
					updateDisplay();
				}, i);
				for (let i = 0; i < e; i++)
				{
					gameState.effect(game);
               game.pointsPerClick += 1;
				}
				gameState.cost = 0;
				updateDisplay();
			}
			else
			{}
		}
		window.gameRoutine = gameRoutine;
	})();
	//ismael it is right here :) ^^^^^
	clickButton.addEventListener("click", () =>
	{
		gameConfig.points += gameConfig.pointsPerClick;
		updateDisplay();
	});
	const clickSound = new Audio('click.mp3');
	document.addEventListener("keyup", (event) =>
	{
		if (event.code === "Space")
		{
			gameConfig.points += gameConfig.pointsPerClick;
			updateDisplay();
			clickSound.cloneNode().play();
			document.getElementById("clickButton").style.transform = 'scale(1)';
		}
	});
	document.addEventListener("keydown", (event) =>
	{
		if (event.code === "Space")
		{
			document.getElementById("clickButton").style.transform = 'scale(0.8)';
		}
	});
	const menu = document.querySelector(".menu");
	const icon = document.querySelector(".menu-icon");
	icon.addEventListener("click", () =>
	{
		menu.classList.toggle("active");
	});
	let clickTimes = [];
	const detectionThreshold = 7;
	const detectionInterval = 500;
	document.addEventListener('click', () =>
	{
		const now = Date.now();
		clickTimes.push(now);
		clickTimes = clickTimes.filter(time => now - time <= detectionInterval);
		if (clickTimes.length > detectionThreshold)
		{
			detect('kvap.jpg', 'sound.mp3');
		}
	});
	document.getElementById('saveButton').addEventListener('click', saveGame);
	document.getElementById('loadButton').addEventListener('click', loadGame);
	document.getElementById('deleteButton').addEventListener('click', deleteSave);
	initializeUpgrades();
	updateDisplay();
});