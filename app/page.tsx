'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Task {
  id: number
  content: string
  deadline: string
  status: '待执行' | '执行中' | '已完成'
  priority: '普通' | '紧急' | '非常紧急'
  completedAt?: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [deadline, setDeadline] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('待执行')
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('普通')
  const [editingTask, setEditingTask] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPriority, setEditPriority] = useState<Task['priority']>('普通')

  const addTask = () => {
    if (newTask.trim() && deadline) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          content: newTask,
          deadline: deadline,
          status: newTaskStatus,
          priority: newTaskPriority
        }
      ])
      setNewTask('')
      setDeadline('')
      setNewTaskPriority('普通')
    }
  }

  const updateStatus = (id: number, status: Task['status']) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status,
          completedAt: status === '已完成' ? new Date().toISOString() : task.completedAt
        }
      }
      return task
    }))
  }

  const getRemainingTime = (deadline: string) => {
    const remaining = new Date(deadline).getTime() - new Date().getTime()
    
    if (remaining < 0) {
      // 计算超时时间
      const overdue = Math.abs(remaining)
      const days = Math.floor(overdue / (1000 * 60 * 60 * 24))
      const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      return {
        isOverdue: true,
        time: `${days}天${hours}小时`
      }
    }
    
    // 计算剩余时间
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return {
      isOverdue: false,
      time: `${days}天${hours}小时`
    }
  }

  const getStatusMessage = (status: Task['status'], deadline: string) => {
    const isOverdue = new Date(deadline).getTime() - new Date().getTime() < 0;
    
    if (isOverdue && status !== '已完成') {
      return '落伍了';
    }
    
    switch (status) {
      case '待执行':
        return '抓紧干';
      case '执行中':
        return '加油干';
      case '已完成':
        return '好样的';
    }
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const getPriorityMessage = (priority: Task['priority']) => {
    switch (priority) {
      case '普通':
        return '按计划进行';
      case '紧急':
        return '请优先处理';
      case '非常紧急':
        return '立即处理！';
    }
  }

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (a.status === '已完成' && b.status !== '已完成') return 1;
      if (a.status !== '已完成' && b.status === '已完成') return -1;
      
      if (a.status === '已完成' && b.status === '已完成') {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      }
      
      const priorityOrder = {
        '非常紧急': 0,
        '紧急': 1,
        '普通': 2
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditContent(task.content)
    setEditPriority(task.priority)
  }

  const saveEdit = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, content: editContent, priority: editPriority }
        : task
    ))
    setEditingTask(null)
  }

  const cancelEdit = () => {
    setEditingTask(null)
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <h1 className={styles.mainTitle}>待办事项管理系统</h1>
        <p className={styles.subTitle}>任务跟踪与时间管理</p>
      </div>

      <div className={styles.inputSection}>
        <h2 className={styles.sectionTitle}>新建任务</h2>
        <div className={styles.inputContainer}>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={styles.timeInput}
          />
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            className={styles.taskInput}
          />
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value as Task['status'])}
            className={`${styles.statusSelect} ${styles[newTaskStatus]}`}
          >
            <option value="待执行">待执行</option>
            <option value="执行中">执行中</option>
            <option value="已完成">已完成</option>
          </select>
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
            className={`${styles.prioritySelect} ${styles[`priority_${newTaskPriority}`]}`}
          >
            <option value="普通">普通</option>
            <option value="紧急">紧急</option>
            <option value="非常紧急">非常紧急</option>
          </select>
          <button onClick={addTask} className={styles.addButton}>
            添加
          </button>
        </div>
      </div>

      <div className={styles.taskListSection}>
        <h2 className={styles.sectionTitle}>任务列表</h2>
        <div className={styles.listHeader}>
          <div className={styles.headerNumber}>序号</div>
          <div className={styles.headerTime}>计划完成时间</div>
          <div className={styles.headerContent}>任务内容</div>
          <div className={styles.headerStatus}>执行状态</div>
          <div className={styles.headerPriority}>优先级别</div>
          <div className={styles.headerHint}>执行提示</div>
          <div className={styles.headerTimeStatus}>时间状态</div>
          <div className={styles.headerAction}>操作</div>
        </div>

        <div className={styles.taskList}>
          {sortTasks(tasks).map((task, index) => (
            <div key={task.id} className={`${styles.taskItem} ${styles[`priority_border_${task.priority}`]}`}>
              <div className={styles.taskHeader}>
                <div className={styles.taskNumber}>
                  {`任务${index + 1}`}
                </div>
                <div className={styles.timeInfoWrapper}>
                  <div className={styles.timeInfo}>
                    <div className={styles.timeGroup}>
                      <div className={styles.deadlineTime}>
                        <span className={styles.timeLabel}>计划时间：</span>
                        <span className={styles.timeValue}>{formatDateTime(task.deadline)}</span>
                      </div>
                      {task.status === '已完成' && task.completedAt && (
                        <div className={`${styles.completedTime} ${
                          new Date(task.completedAt) <= new Date(task.deadline) 
                            ? styles.completedEarly 
                            : styles.completedLate
                        }`}>
                          <span className={styles.timeLabel}>完成时间：</span>
                          <span className={styles.timeValue}>{formatDateTime(task.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.taskBody}>
                {editingTask === task.id ? (
                  <div className={styles.editContainer}>
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editInput}
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                      className={`${styles.prioritySelect} ${styles[`priority_${editPriority}`]}`}
                    >
                      <option value="普通">普通</option>
                      <option value="紧急">紧急</option>
                      <option value="非常紧急">非常紧急</option>
                    </select>
                    <div className={styles.editButtons}>
                      <button onClick={() => saveEdit(task.id)} className={styles.saveButton}>
                        保存
                      </button>
                      <button onClick={cancelEdit} className={styles.cancelButton}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.taskContent}>{task.content}</div>
                )}
              </div>

              <div className={styles.taskControls}>
                <div className={styles.statusGroup}>
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
                    className={`${styles.statusSelect} ${styles[task.status]}`}
                  >
                    <option value="待执行">待执行</option>
                    <option value="执行中">执行中</option>
                    <option value="已完成">已完成</option>
                  </select>
                  <div className={`${styles.priorityMessage} ${styles[`priority_${task.priority}`]}`}>
                    {getPriorityMessage(task.priority)}
                  </div>
                </div>

                <div className={styles.messageGroup}>
                  <div className={`${styles.statusMessage} ${
                    new Date(task.deadline).getTime() - new Date().getTime() < 0 && task.status !== '已完成'
                      ? styles.overdue
                      : styles[`message_${task.status}`]
                  }`}>
                    {getStatusMessage(task.status, task.deadline)}
                  </div>
                  <div className={`${styles.remainingTimeContainer} ${
                    getRemainingTime(task.deadline).isOverdue ? styles.overdueTime : styles[task.status]
                  }`}>
                    <span className={styles.remainingTimeLabel}>
                      {getRemainingTime(task.deadline).isOverdue ? '已超时：' : '剩余时间：'}
                    </span>
                    <span className={`${styles.remainingTimeValue} ${
                      getRemainingTime(task.deadline).isOverdue ? styles.overdueValue : ''
                    }`}>
                      {getRemainingTime(task.deadline).time}
                    </span>
                  </div>
                </div>

                {editingTask !== task.id && (
                  <div className={styles.actionButtons}>
                    <button onClick={() => startEdit(task)} className={styles.editButton}>
                      修改
                    </button>
                    <button onClick={() => deleteTask(task.id)} className={styles.deleteButton}>
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
