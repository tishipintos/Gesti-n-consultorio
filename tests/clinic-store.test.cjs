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

test('profiles share the calendar and persist separate scheduling and attending roles', () => {
  saved.set('clinic_data', JSON.stringify({ clients: [], photos: [], appointments: [{ id: 'legacy' }] }))
  const store = reload().useStore
  assert.equal(store.getState().activeProfile, 'coti')
  const appointment = store.getState().addAppointment({ clientId: 'patient', procedure: 'Botox', attendedBy: 'pitu' })
  store.getState().setActiveProfile('pitu')
  assert.equal(store.getState().appointments.length, 2)
  store.getState().updateAppointment(appointment.id, { notes: 'Updated', scheduledBy: 'pitu' })
  const restored = reload().useStore.getState()
  assert.equal(restored.activeProfile, 'pitu')
  assert.equal(restored.appointments[0].scheduledBy, undefined)
  assert.equal(restored.appointments[1].scheduledBy, 'coti')
  assert.equal(restored.appointments[1].attendedBy, 'pitu')
})

test('profile lists include only the attending profile, in chronological order', () => {
  const { getProfileSections } = require('../src/utils/profiles.ts')
  const client = { id: 'patient', firstName: 'Ana', lastName: 'Prueba' }
  const past = { id: 'past', clientId: client.id, procedure: 'Botox', status: 'completed', date: '2026-09-01', time: '10:00', scheduledBy: 'coti', attendedBy: 'pitu' }
  const future = { ...past, id: 'future', date: '2026-09-10', status: 'scheduled', scheduledBy: 'pitu' }
  const now = new Date('2026-09-05T12:00:00')
  const appointments = [
    future,
    { ...past, id: 'older', date: '2026-08-01' },
    { ...future, id: 'sooner', date: '2026-09-06' },
    { ...past, id: 'unassigned', scheduledBy: 'pitu', attendedBy: undefined },
    { ...future, id: 'unassigned-future', scheduledBy: 'pitu', attendedBy: undefined },
    { ...future, id: 'cancelled', status: 'cancelled' },
    past,
  ]
  const pitu = getProfileSections('pitu', appointments, [client], now)
  const coti = getProfileSections('coti', appointments, [client], now)
  assert.deepEqual(pitu.history.map(a => a.id), ['past', 'older'])
  assert.deepEqual(pitu.future.map(a => a.id), ['sooner', 'future'])
  assert.deepEqual(pitu.followUps.map(a => a.date), ['2026-09-08'])
  assert.deepEqual(coti.history, [])
  assert.equal(coti.future.length + coti.followUps.length, 0)
})
