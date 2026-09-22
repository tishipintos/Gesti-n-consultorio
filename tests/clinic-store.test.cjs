const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

// Load shared TypeScript business logic without a new test-runner dependency.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  })
  module._compile(outputText, filename)
}
let saved
let failWrite
global.localStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => { if (failWrite) throw new Error('Storage full'); saved.set(key, value) },
}
const storePath = require.resolve('../src/store/index.ts')
function reload() { delete require.cache[storePath]; return require(storePath) }
beforeEach(() => { saved = new Map(); failWrite = false })

test('patients, appointments, payment changes and photo references survive reload', () => {
  const store = reload().useStore
  const client = store.getState().addClient({ firstName: 'Ana', lastName: 'Prueba' })
  const appointment = store.getState().addAppointment({ clientId: client.id, date: '2026-09-20', time: '10:00', procedure: 'Botox', status: 'scheduled' })
  store.getState().updateAppointment(appointment.id, { paid: true, status: 'completed' })
  store.getState().addPhoto({ clientId: client.id, fileUrl: 'clinic-photos/test.jpg', type: 'before', takenAt: '2026-09-20T10:00:00Z' })
  const restored = reload().useStore.getState()
  assert.equal(restored.clients[0].firstName, 'Ana')
  assert.equal(restored.appointments[0].paid, true)
  assert.equal(restored.appointments[0].status, 'completed')
  assert.equal(restored.photos[0].fileUrl, 'clinic-photos/test.jpg')
  restored.deleteClient(client.id)
  const deleted = reload().useStore.getState()
  assert.equal(deleted.clients.length + deleted.appointments.length + deleted.photos.length, 0)
})
test('a failed save or clear preserves the current state and persisted data', () => {
  const store = reload().useStore
  store.getState().addClient({ firstName: 'Ana', lastName: 'Prueba' })
  const before = saved.get('clinic_data')
  failWrite = true
  assert.throws(() => store.getState().addClient({ firstName: 'Otro', lastName: 'Paciente' }), /Storage full/)
  assert.throws(() => store.getState().clearAllData(), /Storage full/)
  assert.equal(store.getState().clients.length, 1)
  assert.equal(saved.get('clinic_data'), before)
})
test('unreadable stored data is not overwritten with an empty clinic', () => {
  saved.set('clinic_data', '{broken')
  const { useStore, storageLoadError } = reload()
  assert.ok(storageLoadError)
  assert.throws(() => useStore.getState().addClient({ firstName: 'Ana', lastName: 'Prueba' }))
  assert.equal(saved.get('clinic_data'), '{broken')
})
test('unsupported procedures do not create an appointment', () => {
  const store = reload().useStore
  assert.throws(() => store.getState().addAppointment({ clientId: 'test', date: '2026-09-20', time: '10:00', procedure: 'Invalid', status: 'scheduled' }))
  assert.equal(store.getState().appointments.length, 0)
})
test('follow-up and payment reminders keep their existing timing rules', () => {
  const { getFollowUpNotifications } = require('../src/utils/procedures.ts')
  const { getPaymentNotifications } = require('../src/utils/payments.ts')
  const clients = [{ id: 'patient', firstName: 'Ana', lastName: 'Prueba' }]
  const appointments = [{ id: 'turn', clientId: 'patient', date: '2026-09-01', time: '10:00', procedure: 'Botox', status: 'completed', paid: false }]
  assert.equal(getFollowUpNotifications(appointments, clients, '2026-09-07').length, 0)
  assert.equal(getFollowUpNotifications(appointments, clients, '2026-09-08').length, 1)
  assert.equal(getPaymentNotifications(appointments, clients, new Date('2026-09-09T12:00:00').getTime()).length, 1)
  appointments[0].paid = true
  assert.equal(getPaymentNotifications(appointments, clients, new Date('2026-09-09T12:00:00').getTime()).length, 0)
})

 test('payment confirmation changes only payment and survives reload', () => {
  const store = reload().useStore
  const client = store.getState().addClient({ firstName: 'Ana', lastName: 'Prueba' })
  const appointment = store.getState().addAppointment({ clientId: client.id, date: '2026-09-20', time: '10:00', procedure: 'Botox', status: 'scheduled' })
  for (const paid of [true, false]) {
    store.getState().updateAppointment(appointment.id, { paid })
    const restored = reload().useStore.getState().appointments[0]
    assert.equal(restored.paid, paid)
    assert.equal(restored.status, 'scheduled')
    assert.equal(restored.time, '10:00')
  }
})
