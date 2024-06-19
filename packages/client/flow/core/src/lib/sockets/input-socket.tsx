'use client'

import { InputSocketSpecJSON, NodeSpecJSON } from '@magickml/behave-graph'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { colors, valueTypeColorMap } from '../utils/colors'
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@magickml/client-ui'
import ReactJson from 'react-json-view'
import { debounce } from 'lodash'
import { usePubSub } from '@magickml/providers'
import { useSelector } from 'react-redux'
import { RootState } from 'client/state'

export type InputSocketProps = {
  connected: boolean
  value: any | undefined
  onChange: (key: string, value: any) => void
  lastEventInput: any
  specJSON: NodeSpecJSON[]
  hideValue?: boolean
  textEditorState: string
  valueTypeName?: string
  nodeId: string
  hide?: boolean
} & InputSocketSpecJSON

const InputFieldForValue = ({
  choices,
  value,
  defaultValue,
  onChange,
  name,
  valueType,
  connected,
  hideValue = false,
  nodeId,
}: Pick<
  InputSocketProps,
  | 'choices'
  | 'value'
  | 'defaultValue'
  | 'name'
  | 'onChange'
  | 'valueType'
  | 'connected'
  | 'hideValue'
  | 'nodeId'
>) => {
  const showChoices = choices?.length && choices.length > 0
  const [inputVal, setInputVal] = useState(value ? value : defaultValue ?? '')
  // const [isFocused, setIsFocused] = useState(false)
  const hideValueInput = hideValue || connected
  const { subscribe, publish, events } = usePubSub()
  const { currentTab } = useSelector((state: RootState) => state.tabLayout)

  const inputClass = cx('h-5 text-sm')

  const containerClass = cx(
    'flex w-full rounded-sm items-center pl-1 rounded-sm',
    !hideValueInput && 'bg-[var(--foreground-color)]'
  )

  const debouncedChangeHandler = useCallback(
    debounce((key, value) => {
      onChange(key, value)
      if (currentTab?.id && valueType === 'string') {
        publish(events.$INPUT_TO_CHAT(currentTab.id), {
          value: value,
          nodeId,
          name,
          inputType: valueType,
        })
      }
    }, 1000),
    [onChange]
  )

  const handleChange = ({ key, value }: { key: string; value: any }) => {
    setInputVal(value)
    debouncedChangeHandler(key, value)
  }

  const onFocus = (x: string) => {
    console.log('Active tab id', currentTab?.id)
    if (valueType === 'string' && currentTab?.id) {
      publish(events.$INPUT_TO_CHAT(currentTab.id), {
        value: x,
        nodeId,
        name,
        inputType: valueType,
      })
      // setIsFocused(true)
      onChange(name, x)

      return
    }
  }

  const onBlur = () => {
    // setIsFocused(false)
  }

  useEffect(() => {
    if (!currentTab) return
    const unsubscribe = subscribe(
      events.$CHAT_TO_INPUT(currentTab.id),
      (eventName, { value, nodeId: incomingNodeId, name, inputType }) => {
        console.log('SOCKET INCOMING NODE ID', {
          incomingNodeId,
          value,
          nodeId,
        })
        if (nodeId !== incomingNodeId) return
        onChange(name, value)
        setInputVal(value || '')
      }
    )

    return () => {
      unsubscribe()
    }
  }, [currentTab, name, setInputVal])

  return (
    <div className={containerClass}>
      {/* flex layout these divs 50 50 */}
      <div className="flex flex-1 items-center h-8">
        <p className="flex">{name}</p>
      </div>
      {!hideValueInput && (
        <div className="flex-1 justify-center">
          {showChoices && (
            <Select
              onValueChange={value => onChange(name, value)}
              defaultValue={value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {choices.map(choice => (
                  <SelectItem key={choice.text} value={choice.value}>
                    {choice.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {valueType === 'string' && !showChoices && (
            <Input
              value={inputVal}
              onChange={e => {
                handleChange({ key: name, value: e.currentTarget.value })
              }}
              onBlur={onBlur}
              // @ts-ignore
              onFocus={() => {
                onFocus(value)
              }} //TODO: REBASE_CHECK
              className="m-1 h-6"
            />
          )}
          {valueType === 'float' && !showChoices && (
            <Input
              type="number"
              step="0.01"
              className={inputClass}
              value={Number(value)}
              onChange={e => onChange(name, e.currentTarget.value)}
              // onFocus={() => onFocus(value)}
            />
          )}
          {valueType === 'integer' && !showChoices && (
            <Input
              type="number"
              className={inputClass}
              value={Number(value)}
              onChange={e => {
                onChange(name, Number(e.currentTarget.value))
              }}
              // onFocus={() => onFocus(value)}
            />
          )}
          {valueType === 'boolean' && !showChoices && (
            <div className="flex gap-2 items-center red">
              <Switch
                value={value}
                defaultChecked={value}
                onCheckedChange={value => {
                  onChange(name, value)
                }}
                // onFocus={() => onFocus(value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const InputSocket: React.FC<InputSocketProps> = ({
  connected,
  specJSON,
  lastEventInput,
  // isActive,
  textEditorState,
  nodeId,
  hide,
  ...rest
}) => {
  const { name, valueTypeName } = rest
  let { valueType } = rest

  if (!valueType && valueTypeName) {
    valueType = valueTypeName
  }

  const isFlowSocket = valueType === 'flow'
  const isArraySocket = valueType === 'array'
  const isObjectSocket = valueType === 'object'

  let colorName = valueTypeColorMap[valueType]
  if (colorName === undefined) {
    colorName = 'red'
  }

  // @ts-ignore
  const [backgroundColor, borderColor] = colors[colorName]
  const showName = isFlowSocket === false || name !== 'flow'

  const className = cx(
    'flex grow items-center justify-start h-7 w-full',
    !connected && hide ? 'hidden' : ''
  )
  return (
    <div className={className}>
      {isFlowSocket && (
        <>
          <FontAwesomeIcon icon={faCaretRight} color="#ffffff" size="lg" />
          {showName && <div className="mr-2 truncate">{name}</div>}
        </>
      )}
      {!isFlowSocket && (
        <InputFieldForValue
          {...rest}
          connected={connected}
          hideValue={isArraySocket || isObjectSocket}
          // isActive={isActive}
          valueType={valueType}
          nodeId={nodeId}
        />
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Handle
            id={name}
            type="target"
            position={Position.Left}
            className={cx(
              borderColor,
              connected ? backgroundColor : 'bg-gray-800'
            )}
          />
        </PopoverTrigger>
        <PopoverContent className="w-120" style={{ zIndex: 150 }} side="left">
          <ReactJson
            src={{
              [name]: lastEventInput,
            }}
            style={{ width: 400, overflow: 'scroll' }}
            theme="tomorrow"
            name={false}
            collapsed={1}
            collapseStringsAfterLength={20}
            shouldCollapse={(field: any) => {
              return typeof field === 'string' && field.length > 20
            }}
            enableClipboard={true}
            displayObjectSize={false}
            displayDataTypes={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default InputSocket
