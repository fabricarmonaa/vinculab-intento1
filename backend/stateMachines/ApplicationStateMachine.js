export class ApplicationStateMachine {
  static STATES = Object.freeze(['SENT', 'REVIEWING', 'ACCEPTED', 'REJECTED']);

  static assertKnown(state) {
    if (!this.STATES.includes(state)) {
      throw new Error(`Estado de postulación desconocido: ${state}`);
    }
  }

  static ensureTransition(current, next) {
    this.assertKnown(current);
    this.assertKnown(next);

    const allowed = {
      SENT: ['REVIEWING', 'REJECTED'],
      REVIEWING: ['ACCEPTED', 'REJECTED'],
    };

    const nextStates = allowed[current];
    if (!nextStates || !nextStates.includes(next)) {
      throw new Error('Transición de postulación inválida');
    }
  }

  static initial() {
    return 'SENT';
  }
}
