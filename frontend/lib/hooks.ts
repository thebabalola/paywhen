'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { PAYMENT_FACTORY_ADDRESS } from './constants'
import { PaymentFactoryABI, ConditionalPaymentABI } from './contracts'

// ============================================================================
// PaymentFactory Hooks
// ============================================================================

export function useGetPaymentAddress(paymentId: bigint) {
  return useReadContract({
    address: PAYMENT_FACTORY_ADDRESS,
    abi: PaymentFactoryABI,
    functionName: 'getPayment',
    args: [paymentId],
    query: {
      enabled: !!paymentId,
    }
  })
}

export function useUserPayments(userAddress: `0x${string}`) {
  return useReadContract({
    address: PAYMENT_FACTORY_ADDRESS,
    abi: PaymentFactoryABI,
    functionName: 'getUserPaymentIds',
    args: [userAddress],
    query: {
      enabled: !!userAddress && userAddress !== '0x0000000000000000000000000000000000000000',
    }
  })
}

export function useCreateTimestampPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function createTimestampPayment({
    recipient,
    amount,
    executeAt,
  }: {
    recipient: `0x${string}`
    amount: string
    executeAt: bigint
  }) {
    if (!recipient || !amount) throw new Error('Recipient and amount required')

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createTimeBasedPayment',
      value: parseEther(amount),
      args: [recipient, executeAt]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { createTimestampPayment, hash, isPending, isConfirming, isSuccess, error }
}

export function useCreateManualPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function createManualPayment({
    recipient,
    amount,
    approvers,
    requiredApprovals = 1n,
  }: {
    recipient: `0x${string}`
    amount: string
    approvers: `0x${string}`[]
    requiredApprovals?: bigint
  }) {
    if (!recipient || !amount || approvers.length === 0) {
      throw new Error('Recipient, amount, and at least one approver required')
    }

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createManualPayment',
      value: parseEther(amount),
      args: [recipient, approvers, requiredApprovals]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { createManualPayment, hash, isPending, isConfirming, isSuccess, error }
}

export function useCreateRecurringPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function createRecurringPayment({
    recipient,
    amount,
    startTime,
    interval,
    occurrences
  }: {
    recipient: `0x${string}`
    amount: string
    startTime: bigint
    interval: bigint
    occurrences: bigint
  }) {
    if (!recipient || !amount) throw new Error('Recipient and amount required')

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createRecurringPayment',
      value: parseEther(amount),
      args: [recipient, startTime, interval, occurrences]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { createRecurringPayment, hash, isPending, isConfirming, isSuccess, error }
}

// ============================================================================
// ConditionalPayment Instance Hooks
// ============================================================================

export function useConditionalPayment(paymentAddress: `0x${string}` | undefined) {
  const enabled = !!paymentAddress && paymentAddress !== '0x0000000000000000000000000000000000000000'

  const { data: sender } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'sender', query: { enabled } })
  const { data: recipient } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'recipient', query: { enabled } })
  const { data: amount } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'amount', query: { enabled } })
  const { data: conditionType } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'conditionType', query: { enabled } })
  const { data: executed } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'executed', query: { enabled } })
  const { data: refunded } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'refunded', query: { enabled } })
  const { data: executeAt } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'executeAt', query: { enabled } })
  const { data: startTime } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'startTime', query: { enabled } })
  const { data: interval } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'interval', query: { enabled } })
  const { data: occurrences } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'occurrences', query: { enabled } })
  const { data: executedCount } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'executedCount', query: { enabled } })
  const { data: requiredApprovals } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'requiredApprovals', query: { enabled } })
  const { data: approvalCount } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'getApprovalCount', query: { enabled } })
  const { data: canExecute } = useReadContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'checkCondition', query: { enabled } })

  return {
    sender,
    recipient,
    amount: amount ? formatEther(amount as bigint) : undefined,
    amountRaw: amount as bigint | undefined,
    conditionType: conditionType as number | undefined,
    executed: executed as boolean | undefined,
    refunded: refunded as boolean | undefined,
    executeAt: executeAt as bigint | undefined,
    startTime: startTime as bigint | undefined,
    interval: interval as bigint | undefined,
    occurrences: occurrences as bigint | undefined,
    executedCount: executedCount as bigint | undefined,
    requiredApprovals: requiredApprovals as bigint | undefined,
    approvalCount: approvalCount as bigint | undefined,
    canExecute: canExecute as boolean | undefined,
    isLoading: enabled && (amount === undefined) // Simple loading check
  }
}

export function useExecutePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  async function execute(paymentAddress: `0x${string}`) {
    writeContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'execute' })
  }
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { execute, hash, isPending, isConfirming, isSuccess, error }
}

export function useRefundPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  async function refund(paymentAddress: `0x${string}`) {
    writeContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'refund' })
  }
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { refund, hash, isPending, isConfirming, isSuccess, error }
}

export function useApprovePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  async function approve(paymentAddress: `0x${string}`) {
    writeContract({ address: paymentAddress, abi: ConditionalPaymentABI, functionName: 'approveManual' })
  }
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { approve, hash, isPending, isConfirming, isSuccess, error }
}
