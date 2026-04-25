'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { PAYMENT_FACTORY_ADDRESS } from './constants'
import { PaymentFactoryABI } from './contracts'
import { ConditionalPaymentABI } from './contracts'

// ============================================================================
// PaymentFactory Hooks
// ============================================================================

export function usePaymentFactory() {
  return useReadContract({
    address: PAYMENT_FACTORY_ADDRESS,
    abi: PaymentFactoryABI,
    functionName: 'getPaymentInfo',
  })
}

export function useGetPaymentInfo(paymentId: bigint) {
  return useReadContract({
    address: PAYMENT_FACTORY_ADDRESS,
    abi: PaymentFactoryABI,
    functionName: 'getPaymentInfo',
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
    functionName: 'userPayments',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    }
  })
}

export function useCreateTimestampPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function createTimestampPayment({
    recipient,
    amount,
    executeAt,
    approvers = [] as `0x${string}`[],
    requiredApprovals = 0n
  }: {
    recipient: `0x${string}`
    amount: string
    executeAt: bigint
    approvers?: `0x${string}`[]
    requiredApprovals?: bigint
  }) {
    if (!recipient || !amount) throw new Error('Recipient and amount required')

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createTimestampPayment',
      value: parseEther(amount),
      args: [recipient, executeAt, approvers, requiredApprovals]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    createTimestampPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
}

export function useCreateManualPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function createManualPayment({
    recipient,
    amount,
    approvers,
    requiredApprovals = 1n,
    refundTimeout = 1296000n // 15 days in seconds
  }: {
    recipient: `0x${string}`
    amount: string
    approvers: `0x${string}`[]
    requiredApprovals?: bigint
    refundTimeout?: bigint
  }) {
    if (!recipient || !amount || approvers.length === 0) {
      throw new Error('Recipient, amount, and at least one approver required')
    }

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createManualPayment',
      value: parseEther(amount),
      args: [recipient, approvers, requiredApprovals, refundTimeout]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    createManualPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
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
    if (interval === 0n) throw new Error('Interval must be > 0')
    if (occurrences === 0n) throw new Error('Occurrences must be > 0')

    writeContract({
      address: PAYMENT_FACTORY_ADDRESS,
      abi: PaymentFactoryABI,
      functionName: 'createRecurringPayment',
      value: parseEther(amount),
      args: [recipient, startTime, interval, occurrences, parseEther(amount)]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    createRecurringPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
}

// ============================================================================
// ConditionalPayment Instance Hooks
// ============================================================================

export function useConditionalPayment(paymentAddress: `0x${string}` | undefined) {
  const { data: sender } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'sender',
    query: { enabled: !!paymentAddress }
  })

  const { data: recipient } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'recipient',
    query: { enabled: !!paymentAddress }
  })

  const { data: amount } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'amount',
    query: { enabled: !!paymentAddress }
  })

  const { data: conditionType } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'conditionType',
    query: { enabled: !!paymentAddress }
  })

  const { data: executed } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'executed',
    query: { enabled: !!paymentAddress }
  })

  const { data: refunded } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'refunded',
    query: { enabled: !!paymentAddress }
  })

  const { data: executeAt } = useReadContract({
    address: paymentAddress,
    abi: ConditionalPaymentABI,
    functionName: 'executeAt',
    query: { enabled: !!paymentAddress }
  })

  return {
    sender,
    recipient,
    amount: amount ? formatEther(amount as bigint) : undefined,
    amountRaw: amount,
    conditionType: conditionType as number | undefined,
    executed: executed as boolean | undefined,
    refunded: refunded as boolean | undefined,
    executeAt: executeAt as bigint | undefined
  }
}

export function useExecutePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function execute(paymentAddress: `0x${string}`) {
    writeContract({
      address: paymentAddress,
      abi: ConditionalPaymentABI,
      functionName: 'execute'
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return { execute, hash, isPending, isConfirming, isSuccess, error }
}

export function useRefundPayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function refund(paymentAddress: `0x${string}`) {
    writeContract({
      address: paymentAddress,
      abi: ConditionalPaymentABI,
      functionName: 'refund'
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return { refund, hash, isPending, isConfirming, isSuccess, error }
}

export function useApprovePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  async function approve(paymentAddress: `0x${string}`) {
    writeContract({
      address: paymentAddress,
      abi: ConditionalPaymentABI,
      functionName: 'approve'
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return { approve, hash, isPending, isConfirming, isSuccess, error }
}
