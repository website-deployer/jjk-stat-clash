import type { Party, PartyServer, Connection, Request } from "partykit/server";

export default class DraftServer implements PartyServer {
  constructor(readonly party: Party) {}

  state: any = {
    players: [],
    bans: [],
    partialBans: [],
    lockedBans: [],
    readyToClash: [],
    roundWins: [],
    draftPhase: 'setup',
    draftMode: 'normal',
    activePlayer: 0,
    timeLeft: 30,
    maxPlayers: 2,
    gambleConfig: { totalRolls: 50, luckyRolls: 10, rollsPerStat: 5 },
    gambleStates: {}
  };

  timerInterval: ReturnType<typeof setInterval> | null = null;

  onRequest(req: any): any {
    return new Response("JJK Stat Clash Party Server is online.", { status: 200 });
  }

  onConnect(conn: Connection, ctx: any) {
    if (this.state.players.length >= 8) {
      conn.send(JSON.stringify({ type: 'error', message: 'Lobby is full' }));
      return;
    }

    if (this.state.draftPhase !== 'setup') {
      // Reconnection logic: find player by ID
      const existingPlayer = this.state.players.find((p: any) => p.id === conn.id);
      if (existingPlayer) {
        this.broadcastState();
        return;
      }
      conn.send(JSON.stringify({ type: 'error', message: 'Game already in progress' }));
      return;
    }

    const playerNum = this.state.players.length + 1;
    this.state.players.push({
      id: conn.id,
      draft: this.getEmptyDraft(),
      name: `Player ${playerNum}`
    });
    this.state.bans.push([]);
    this.state.partialBans.push([null, null]);
    this.state.lockedBans.push(false);
    this.state.readyToClash.push(false);
    this.state.roundWins.push(0);
    this.state.gambleStates[conn.id] = {
      remainingTotal: this.state.gambleConfig.totalRolls,
      remainingLucky: this.state.gambleConfig.luckyRolls,
      statRolls: {}
    };

    this.broadcastState();
  }

  onClose(conn: Connection) {
    if (this.state.draftPhase === 'setup') {
      const index = this.state.players.findIndex((p: any) => p.id === conn.id);
      if (index !== -1) {
        this.state.players.splice(index, 1);
        this.state.bans.splice(index, 1);
        this.state.partialBans.splice(index, 1);
        this.state.lockedBans.splice(index, 1);
        this.state.readyToClash.splice(index, 1);
        this.state.roundWins.splice(index, 1);
        delete this.state.gambleStates[conn.id];
        this.broadcastState();
      }
    }
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message);
    const pIndex = this.state.players.findIndex((p: any) => p.id === sender.id);
    const isHost = pIndex === 0;

    if (data.type === 'setMaxPlayers' && isHost) {
      this.state.maxPlayers = data.maxPlayers;
      this.broadcastState();
    }

    if (data.type === 'setDraftMode' && isHost) {
      this.state.draftMode = data.mode;
      this.broadcastState();
    }

    if (data.type === 'updateGambleConfig' && isHost) {
      this.state.gambleConfig = data.config;
      this.state.players.forEach((p: any) => {
        this.state.gambleStates[p.id] = {
          remainingTotal: data.config.totalRolls,
          remainingLucky: data.config.luckyRolls,
          statRolls: {}
        };
      });
      this.broadcastState();
    }

    if (data.type === 'startGame' && isHost) {
      if (this.state.players.length >= 2) {
        this.state.draftPhase = 'banning';
        this.broadcastState();
      }
    }

    if (data.type === 'updateName' && pIndex !== -1) {
      this.state.players[pIndex].name = data.name;
      this.broadcastState();
    }

    if (data.type === 'updateBans' && pIndex !== -1 && !this.state.lockedBans[pIndex]) {
      this.state.partialBans[pIndex] = data.bans;
      this.broadcastState();
    }

    if (data.type === 'submitBans' && pIndex !== -1 && !this.state.lockedBans[pIndex]) {
      const otherLockedBans: string[] = [];
      this.state.bans.forEach((b: string[], i: number) => {
        if (i !== pIndex && this.state.lockedBans[i]) {
          otherLockedBans.push(...b);
        }
      });
      
      const validBans = data.bans.filter((b: string) => b && !otherLockedBans.includes(b));
      if (validBans.length < 2) {
        sender.send(JSON.stringify({ type: 'banConflict', conflictingBans: otherLockedBans }));
        return;
      }

      this.state.bans[pIndex] = data.bans;
      this.state.partialBans[pIndex] = data.bans;
      this.state.lockedBans[pIndex] = true;
      
      const allBanned = this.state.lockedBans.every((locked: boolean) => locked);
      if (allBanned && this.state.players.length >= 2) {
        this.state.draftPhase = 'drafting';
        this.state.activePlayer = 0;
        this.startTimer();
      }
      this.broadcastState();
    }

    if (data.type === 'selectDraft' && pIndex === this.state.activePlayer && this.state.draftPhase === 'drafting') {
      if (this.state.players[pIndex].draft[data.stat]) return;
      this.state.players[pIndex].draft[data.stat] = data.entityId;
      this.advanceTurn();
    }

    if (data.type === 'gambleRoll' && pIndex !== -1 && this.state.draftPhase === 'drafting' && this.state.draftMode === 'gamble') {
      const gState = this.state.gambleStates[sender.id];
      if (!gState) return;
      
      const isLucky = data.isLucky;
      const stat = data.stat;
      
      if (stat !== 'bindingVow' && gState.remainingTotal <= 0) return;
      if (isLucky && gState.remainingLucky <= 0) return;
      if ((gState.statRolls[stat] || 0) >= this.state.gambleConfig.rollsPerStat) return;

      this.state.gambleStates[sender.id] = {
        ...gState,
        remainingTotal: stat === 'bindingVow' ? gState.remainingTotal : gState.remainingTotal - 1,
        remainingLucky: isLucky ? gState.remainingLucky - 1 : gState.remainingLucky,
        statRolls: { ...gState.statRolls, [stat]: (gState.statRolls[stat] || 0) + 1 }
      };
      this.state.players[pIndex].draft[stat] = data.entityId;
      this.broadcastState();
    }

    if (data.type === 'readyToClash' && pIndex !== -1 && this.state.draftPhase === 'draftComplete') {
      this.state.readyToClash[pIndex] = true;
      if (this.state.readyToClash.every((r: boolean) => r)) {
        this.state.draftPhase = 'transitioning';
        if (this.timerInterval) clearInterval(this.timerInterval);
      }
      this.broadcastState();
    }

    if (data.type === 'startComparing' && isHost && this.state.draftPhase === 'transitioning') {
      this.state.draftPhase = 'comparing';
      this.broadcastState();
    }

    if (data.type === 'recordWin' && isHost) {
      data.winners.forEach((wIdx: number) => {
        if (this.state.roundWins[wIdx] !== undefined) {
          this.state.roundWins[wIdx]++;
        }
      });
      this.broadcastState();
    }

    if (data.type === 'resetGame' && isHost) {
      this.state.draftPhase = 'banning';
      this.state.players.forEach((p: any) => {
        p.draft = this.getEmptyDraft();
      });
      this.state.bans = this.state.players.map(() => []);
      this.state.partialBans = this.state.players.map(() => [null, null]);
      this.state.lockedBans = this.state.players.map(() => false);
      this.state.readyToClash = this.state.players.map(() => false);
      this.state.players.forEach((p: any) => {
        this.state.gambleStates[p.id] = {
          remainingTotal: this.state.gambleConfig.totalRolls,
          remainingLucky: this.state.gambleConfig.luckyRolls,
          statRolls: {}
        };
      });
      this.broadcastState();
    }
  }

  getEmptyDraft() {
    const statsList = ['strength', 'speed', 'durability', 'ce', 'ct', 'body', 'tool', 'specialPower1', 'specialPower2', 'shikigami', 'domainExpansion', 'iq'];
    const draft: any = {};
    statsList.forEach(s => draft[s] = null);
    draft.bindingVow = null;
    return draft;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state.timeLeft = 30;
    this.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      if (this.state.timeLeft <= 0) {
        this.autoPickForActivePlayer();
      } else {
        this.party.broadcast(JSON.stringify({ type: 'timer', timeLeft: this.state.timeLeft }));
      }
    }, 1000);
  }

  advanceTurn() {
    const statsList = ['strength', 'speed', 'durability', 'ce', 'ct', 'body', 'tool', 'specialPower1', 'specialPower2', 'shikigami', 'domainExpansion', 'iq'];
    const allFull = this.state.players.every((p: any) => statsList.every(stat => p.draft[stat] !== null));
    
    if (allFull) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.state.draftPhase = 'draftComplete';
      this.broadcastState();
      return;
    }

    let nextPlayer = (this.state.activePlayer + 1) % this.state.players.length;
    let attempts = 0;
    while (attempts < this.state.players.length) {
      const hasEmpty = statsList.some(s => this.state.players[nextPlayer].draft[s] === null);
      if (hasEmpty) break;
      nextPlayer = (nextPlayer + 1) % this.state.players.length;
      attempts++;
    }

    this.state.activePlayer = nextPlayer;
    this.state.timeLeft = 30;
    this.broadcastState();
    this.startTimer();
  }

  autoPickForActivePlayer() {
    const pIndex = this.state.activePlayer;
    const player = this.state.players[pIndex];
    if (!player) return this.advanceTurn();

    const statsList = ['strength', 'speed', 'durability', 'ce', 'ct', 'body', 'tool', 'specialPower1', 'specialPower2', 'shikigami', 'domainExpansion', 'iq'];
    const emptyStat = statsList.find(s => player.draft[s] === null);

    if (!emptyStat) return this.advanceTurn();

    if (this.state.draftMode === 'gamble') {
      const gState = this.state.gambleStates[player.id];
      const charIds = ["yuji-itadori", "megumi-fushiguro", "nobara-kugisaki", "satoru-gojo", "kento-nanami", "maki-zenin", "toge-inumaki", "panda", "aoi-todo", "mai-zenin", "kasumi-miwa", "kokichi-muta", "momo-nishimiya", "noritoshi-kamo", "utahime-iori", "mei-mei", "naobito-zenin", "choso", "eso", "kechizu", "mahito", "jogo", "hanami", "dagon", "geto-suguru", "toji-fushiguro", "ryomen-sukuna"];
      const randomId = charIds[Math.floor(Math.random() * charIds.length)];
      
      this.state.gambleStates[player.id] = {
        ...gState,
        remainingTotal: gState.remainingTotal - 1,
        statRolls: { ...gState.statRolls, [emptyStat]: (gState.statRolls[emptyStat] || 0) + 1 }
      };
      player.draft[emptyStat] = randomId;
    } else {
      player.draft[emptyStat] = "yuji-itadori";
    }

    this.advanceTurn();
  }

  broadcastState() {
    this.party.broadcast(JSON.stringify({ type: 'sync', state: this.state }));
  }
}
