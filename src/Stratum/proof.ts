import {SessionID} from './sessionID'
import {extranonce, Extranonce} from './mining/set_extranonce'
import {notify_params, NotifyParams} from './mining/notify'
import {share, Share} from './mining/submit'
import * as boostpow from 'boostpow'

// construct a work proof from
//   * an extra nonce, provided in the subscribe response
//   * notify params
//   * share returned
//   * an optional version mask (provided first, with the configure response
export function prove(
  en: extranonce,
  n: notify_params,
  x: share,
  version_mask?: string): boostpow.work.Proof | undefined {

  if (!Extranonce.valid(en) || !NotifyParams.valid(n) || !Share.valid(x) ||
    (version_mask && !SessionID.valid(version_mask)) ||
    NotifyParams.jobID(n) != Share.jobID(x) ||
    en[1] != Share.extranonce2(x).length ||
    (version_mask && !x[5]) ||
    (!version_mask && x[5])) {
    return
  }

  let p: boostpow.work.Puzzle
  if (version_mask) {
    p = new boostpow.work.Puzzle(
      NotifyParams.version(n),
      NotifyParams.prevHash(n),
      NotifyParams.nbits(n),
      NotifyParams.generationTX1(n),
      NotifyParams.generationTX2(n),
      boostpow.Int32Little.fromNumber(boostpow.Utils.generalPurposeBitsMask())
    )
  } else {
    p = new boostpow.work.Puzzle(
      NotifyParams.version(n),
      NotifyParams.prevHash(n),
      NotifyParams.nbits(n),
      NotifyParams.generationTX1(n),
      NotifyParams.generationTX2(n)
    )
  }

  let u: boostpow.work.Solution
  if (x[5]) {
    u = new boostpow.work.Solution(
      Share.timestamp(x),
      Extranonce.extranonce1(en),
      Share.extranonce2(x),
      Share.nonce(x),
      Share.generalPurposeBits(x)
    )
  } else {
    u = new boostpow.work.Solution(
      Share.timestamp(x),
      Extranonce.extranonce1(en),
      Share.extranonce2(x),
      Share.nonce(x)
    )
  }

  // the proof that is returned may not be valid at this point but
  // we may need to check it against a different difficulty than
  // the one given in the proof.
  return new boostpow.work.Proof(p, u)
}
