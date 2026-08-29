import { useState } from 'react'
import { BookOpen, Bot, Check, FolderCog, FolderUp, PartyPopper, Sparkles } from 'lucide-react'
import { Stepper, Wizard, type WizardStep } from '../src/components/wizard/Wizard'
import { Button } from '../src/components/button/Button'
import { Input } from '../src/components/input/Input'

const steps: WizardStep[] = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Getting started', icon: Sparkles },
  { id: 'workingDir', title: 'Pick a working directory', subtitle: 'Local files', icon: FolderCog },
  { id: 'provider', title: 'Connect a provider', subtitle: 'Bring your own AI', icon: Bot, canContinue: false },
  { id: 'models', title: 'Choose models', subtitle: 'Pick defaults', icon: Check },
  { id: 'course', title: 'Create a course', subtitle: 'First content', icon: BookOpen },
  { id: 'files', title: 'Add files', subtitle: 'Materials', icon: FolderUp },
  { id: 'done', title: 'All set', subtitle: 'Finish setup', icon: PartyPopper, hideFooter: true },
]

function Demo(props: Partial<React.ComponentProps<typeof Wizard>>) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Start onboarding</Button>
      <Wizard
        open={open}
        onOpenChange={setOpen}
        title="Set up your assistant"
        steps={steps}
        renderStep={(ctx) => (
          <div className="space-y-3">
            <p className="text-sm">
              Step <strong>{ctx.id}</strong> ({ctx.index + 1} of {ctx.step === undefined ? 7 : 7}).
              {ctx.id === 'provider' ? ' Continue is gated by canContinue.' : ''}
            </p>
            {ctx.id === 'workingDir' ? (
              <Input label="Directory" defaultValue="~/Documents" />
            ) : null}
            {ctx.isLast ? (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Finish later
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Go to my course
                </Button>
              </div>
            ) : null}
          </div>
        )}
        {...props}
      />
    </>
  )
}

export const ModalWizard = () => <Demo />

export const DrawerWizard = () => <Demo variant="drawer" />

export const StepperDots = () => <Stepper steps={steps} current={2} variant="dots" />

export const StepperLabels = () => {
  const [current, setCurrent] = useState(2)
  return (
    <Stepper
      steps={steps.map((step) => ({ id: step.id, label: step.title, icon: step.icon }))}
      current={current}
      variant="labels"
      onStepClick={setCurrent}
    />
  )
}
