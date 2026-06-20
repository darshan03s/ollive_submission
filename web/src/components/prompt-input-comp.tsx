'use client'

import { Model, modelProviders, models } from '@/ai/models'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from '@/components/ai-elements/prompt-input'
import { ChatStatus } from 'ai'
import { CheckIcon } from 'lucide-react'
import { memo, useCallback } from 'react'

interface ModelItemProps {
  m: Model
  selectedModel: Model['model']
  onSelect: (model: Model['model']) => void
}

const ModelItem = memo(({ m, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(() => onSelect(m.model), [onSelect, m.model])
  return (
    <ModelSelectorItem onSelect={handleSelect} value={m.model}>
      <ModelSelectorLogo provider={m.provider} />
      <ModelSelectorName className="capitalize">{m.modelId}</ModelSelectorName>
      {selectedModel === m.model ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  )
})

ModelItem.displayName = 'ModelItem'

interface PromptInputCompProps {
  handleSubmit: (message: PromptInputMessage) => void
  handleModelSelect: (model: Model['model']) => void
  model: Model['model']
  modelSelectorOpen: boolean
  selectedModelData: Model
  status: ChatStatus
  setModelSelectorOpen: (open: boolean) => void
}

const PromptInputComp = ({
  handleSubmit,
  handleModelSelect,
  model,
  modelSelectorOpen,
  selectedModelData,
  status,
  setModelSelectorOpen
}: PromptInputCompProps) => {
  return (
    <div className="size-full">
      <PromptInputProvider>
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.provider && (
                      <ModelSelectorLogo provider={selectedModelData.provider} />
                    )}
                    {selectedModelData?.modelId && (
                      <ModelSelectorName className="capitalize">
                        {selectedModelData.modelId}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {modelProviders.map((provider) => (
                      <ModelSelectorGroup
                        heading={provider.charAt(0).toUpperCase() + provider.slice(1)}
                        key={provider}
                      >
                        {models
                          .filter((m) => m.provider === provider)
                          .map((m) => (
                            <ModelItem
                              key={m.model}
                              m={m}
                              onSelect={handleModelSelect}
                              selectedModel={model}
                            />
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  )
}

export default PromptInputComp
