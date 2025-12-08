export class StudentVerificationStateMachine {
  static STATES = Object.freeze(['PENDING', 'APPROVED', 'REJECTED']);

  static assertKnown(state) {
    if (!this.STATES.includes(state)) {
      throw new Error(`Estado de verificación desconocido: ${state}`);
    }
  }

  static ensureTransition(current, next) {
    this.assertKnown(current);
    this.assertKnown(next);
    if (current !== 'PENDING' || !['APPROVED', 'REJECTED'].includes(next)) {
      throw new Error('Transición de verificación inválida');
    }
  }

  static initial() {
    return 'PENDING';
  }
}
