// Presentation-only resolver. The host supplies player-known state and playback.
export function createResponseMemory() {
  return { seen: new Set(), lastByUnit: new Map(), lastSelectionAt: -Infinity, variants: new Map() };
}

export function resolveUnitResponse(event, context, memory, library) {
  if (!event || !context || !memory || !library || !context.audioEnabled || context.replayingHistory) return null;
  const now = context.nowRealSeconds;
  if (!Number.isFinite(now) || !event.sourceEventId || !event.actorId) return null;
  const actor = context.knownActors?.[event.actorId];
  if (!actor?.controlled || !actor.known || !actor.availableForPresentation) return null;
  const validKinds = ['selection', 'accepted', 'queued', 'rejected', 'busy', 'cancelled'];
  if (!validKinds.includes(event.kind)) return null;
  if (event.groupCommandId && !event.isGroupSummary) return null;
  if (event.kind === 'selection' && (!event.userInitiated || context.criticalPresentationPending)) return null;
  // Local validation does not prove receipt by a submarine on a delayed link.
  if (event.kind === 'accepted' && (!event.commandId || !event.receiptKnown || event.stage !== 'unit_received')) return null;
  if (event.kind !== 'selection' && !event.commandId) return null;
  if (event.expiresAtRealSeconds !== undefined && event.expiresAtRealSeconds <= now) return null;
  const key = event.kind === 'selection'
    ? `selection:${event.sourceEventId}`
    : `order:${event.groupCommandId || event.commandId}:${event.kind}`;
  if (memory.seen.has(key)) return null;
  if (event.kind === 'selection') {
    const last = memory.lastByUnit.get(event.actorId) ?? -Infinity;
    if (now - last < 5 || now - memory.lastSelectionAt < 0.7) return null;
  }
  const language = context.language === 'en' ? 'en' : 'fr';
  const voiceLanguage = ['fr', 'en'].includes(context.voiceLanguage) ? context.voiceLanguage : language;
  const profileId = event.isGroup ? 'task_group' : actor.responseProfile;
  const profile = library.profiles.find(p => p.id === profileId);
  if (!profile) return null;
  const statusKind = ['queued', 'rejected', 'busy', 'cancelled'].includes(event.kind);
  const detailedCommand = event.kind === 'accepted' && context.useOrderSpecificPhrases && library.orderPhraseIds?.[event.orderType];
  const list = statusKind ? [`status.${event.kind}`]
    : event.kind === 'selection' ? profile.selectionPhraseIds
    : detailedCommand || profile.acceptedPhraseIds;
  if (!list?.length) return null;
  const rotationKey = `${profileId}:${event.kind}:${event.orderType || ''}`;
  const index = memory.variants.get(rotationKey) || 0;
  const phraseId = list[index % list.length];
  const phrase = library.phrases.find(p => p.id === phraseId);
  if (!phrase?.text?.[language]) return null;
  const sfxList = event.kind === 'selection' ? profile.selectionSfx : profile.acceptedSfx;
  const sfxId = statusKind ? library.statusSfx[event.kind] : sfxList[index % sfxList.length];
  const sfx = library.assets.find(a => a.id === sfxId);
  if (!sfx) return null;
  let speech = null;
  if (context.voiceEnabled) {
    const file = phrase.audio?.[voiceLanguage];
    if (file) speech = { kind: 'file', file, language: voiceLanguage };
    else if (context.allowDeviceSpeech && context.deviceVoiceLanguages?.includes(voiceLanguage)) {
      speech = { kind: 'device_tts', text: phrase.text[voiceLanguage], language: voiceLanguage };
    }
  }
  const offlineSelection = event.kind === 'selection' && actor.linkKnownUnavailable === true;
  if (offlineSelection) speech = null;
  memory.seen.add(key);
  if (memory.seen.size > 2048) memory.seen.delete(memory.seen.values().next().value);
  memory.variants.set(rotationKey, index + 1);
  if (event.kind === 'selection') {
    memory.lastByUnit.set(event.actorId, now);
    memory.lastSelectionAt = now;
  }
  return {
    responseId: key, actorId: event.actorId, profileId, phraseId,
    phase: event.kind, speaker: offlineSelection ? 'interface' : statusKind || detailedCommand ? 'command_center' : 'unit',
    sfxFile: sfx.file, speech,
    subtitle: { text: offlineSelection
      ? (language === 'fr' ? 'Unité sélectionnée. Dernier rapport disponible.' : 'Unit selected. Last report available.')
      : phrase.text[language], language },
    priority: event.kind === 'selection' ? 10 : statusKind ? 25 : 30,
    expiresAtRealSeconds: now + (event.kind === 'selection' ? 1.2 : 5),
    doesNotConfirmExecution: true
  };
}
