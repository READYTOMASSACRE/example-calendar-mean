(function () {
  'use strict';


  /**
   * Памятка по momentJs
   * Первый день недели: moment().day(0)
   * Первый день недели, с учетом локали, moment().weekday(0)
   * Первый день месяца: moment().startOf('month')
   * Последний день месяца: moment().endOf('month')
   */

  angular
    .module('calendar')
    .controller('CalendarController', CalendarController)

  CalendarController.$inject = ['$scope', '$state', 'CalendarService', '$window', 'Notification', 'calendarResolve'];

  function CalendarController($scope, $state, CalendarService, $window, Notification, calendar) {
    var vm = this
      , start = moment(vm.currentDate).startOf('month').startOf('week')
      , end = moment(vm.currentDate).endOf('month').endOf('week')

    /** resource calendarResolve init */
    vm.calendar = calendar

    /* form init */
    vm.form = {}

    /* functions */
    vm.remove = remove
    vm.save = save
    vm.render = render
    vm.setActive = setActive
    vm.prepare = prepare
    vm.toggle = toggle
    vm.select = select
    vm.reset = reset
    vm.fetch = fetch
    /* functions directives end */

    /** moment instance init */
    vm.currentDate = moment()
    vm.view = 'month'

    vm.header = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
    vm.isNew = true
    vm.counter = 1

    /** запрашиваем первичные данные и тут же рендерим*/
    vm.fetch()
    vm.render()

    /**
     * удаление записи
     */
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.calendar.$remove(() => {
            Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Запись успешно удалена!' })
            vm.fetch()
            vm.render()
            vm.reset()
        }, (res) => {
            Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Ошибка при удалении!' })
        })
      }
    }

    /**
     * сохранение записи
     */
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.calendarForm');
        return false;
      }

      vm.calendar.createOrUpdate()
        .then(res => {
            Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Запись успешно обновлена!' })
            vm.fetch()
            vm.render()
            vm.reset(res)
        })
        .catch(res => {
            Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Ошибка при сохранении!' })
            vm.fetch()
            vm.render()
            vm.reset()
        })
    }

    /**
     * переключение вида/даты
     */
    function toggle(direction) {
        if (direction === 'left') {
            vm.currentDate = moment(vm.currentDate).subtract(1, vm.view)
        } else if (direction === 'right') {
            vm.currentDate = moment(vm.currentDate).add(1, vm.view)
        } else if (direction == 'day') {
            vm.view = 'day'
        } else if (direction == 'month') {
            vm.view = 'month'
        } else {
            vm.currentDate = moment(new Date())
        }

        vm.fetch()
        vm.render()
    }

    /**
     * обработчик клика по дате
     */
    function select(items, selectedItem) {
        vm.currentDate = moment(selectedItem.m)
        vm.isNew = !selectedItem.active
        items.forEach((itemArr, i, arr) => {
            itemArr.map(item => {
                item.current = false
                return item
            })
        })
        if (!vm.isNew && typeof selectedItem.resource !== 'undefined') {
            vm.counter = 0
            let cloneResource = $.extend(true, Object.create(Object.getPrototypeOf(selectedItem.resource)), selectedItem.resource)
            cloneResource.startedAt = moment(new Date(cloneResource.startedAt)).toString()
            cloneResource.finishedAt = moment(new Date(cloneResource.finishedAt)).toString()
            vm.calendar = cloneResource
            items.forEach((itemArr, i, arr) => {
                itemArr.map(item => {
                    item.current =
                        item.m >= moment(new Date(selectedItem.resource.startedAt)).startOf('hour')
                        && item.m <= moment(new Date(selectedItem.resource.finishedAt)).endOf('hour')
                            ? true
                            : false
                    return item
                })
            })
        } else {
            if (vm.counter === 0 || vm.counter > 2) {
                vm.reset()
            } else if (vm.counter === 1) {
                vm.calendar.startedAt = selectedItem.m.toString()
            } else if (new Date(vm.calendar.startedAt) > selectedItem.m) {
                vm.calendar.finishedAt = moment(new Date(vm.calendar.startedAt)).toString()
                vm.calendar.startedAt = selectedItem.m.toString()
            } else {
                vm.calendar.finishedAt = selectedItem.m.toString()
            }
            vm.counter++
        }
    }

    /**
     * вернуть в дефолтное состояние calendar
     */
    function reset(calendarItem) {
        if (calendarItem) {
            calendarItem.startedAt = moment(new Date(calendarItem.startedAt)).toString()
            calendarItem.finishedAt = moment(new Date(calendarItem.finishedAt)).toString()
            vm.calendar = calendarItem
            vm.isNew = false
        } else {
            vm.calendar._id =  null
            vm.calendar.title =  null
            vm.calendar.description =  null
            vm.calendar.startedAt =  null
            vm.calendar.finishedAt =  null
            vm.isNew = true
        }
        vm.counter = 0
    }

    /**
     * отрендерить календарь
     */
    function render(view, start, end) {
        let data = []
        view = view || vm.view

        if (view === 'month') {
            start = start || moment(vm.currentDate).startOf('month').startOf('week')
            end = end || moment(vm.currentDate).endOf('month').endOf('week')
        } else {
            start = start || moment(vm.currentDate).startOf('day')
            end = end || moment(vm.currentDate).endOf('day')
        }

        while ( start <= end ) {
            if (view == 'month') {
                data.push( { m: start, d: start.get('date') } )
                start = moment(start).add(1, 'days')
            } else {
                data.push( { m: start, d: start.get('hours') + ':00' } )
                start = moment(start).add(1, 'hours')
            }
        }

        return setActive(data, view)
            .then(items => {
                vm.items = items
                $scope.$apply()
                return items
            })
    }

    /**
     * проставить active для тех, кто попадает в записи, которые мы выбрали через fetch
     */
    function setActive(data, view) {
        return new Promise((resolve, reject) => {
            vm.calendarItems.$promise
                .then(resources => {
                    let _data = data.map(item => {
                        let res = resources.find(resource => {
                            return item.m >= moment(resource.startedAt).startOf('hour')
                                && item.m <= moment(resource.finishedAt).endOf('hour')
                        })
                        item.hasActive = false
                        if (res) {
                            item.active = true
                        } else if (view === 'month') {
                            item.active = false
                            if (resources.find(resource => {
                                return item.m >= moment(resource.startedAt).startOf('day')
                                    && item.m <= moment(resource.finishedAt).endOf('day')
                            })) {
                                item.hasActive = true
                            }
                        }

                        item.resource = res
                        return item
                    })
                    resolve(prepare(_data, view))
                })
                .catch(err => reject(err))
        })
    }

    /**
     * подготовливаем дату для вывода
     */
    function prepare(data, view) {
        let _data = []
        view = view || vm.view

        if (view === 'month') {
            let step = 0
            for(let i = 0; i < 6; i++) {
                step = i * 7
                _data.push(data.slice(step, step + 7))
            }
        } else {
            for(let i = 0; i < 12; i++) {
                _data.push([data[i], data[i+12]])
            }
        }

        return _data
    }

    /**
     * запрашиваем api через наш calendarResolve
     */
    function fetch() {
        var start = moment(vm.currentDate).startOf('year')
          , end = moment(vm.currentDate).endOf('year')

        vm.calendarItems = CalendarService.query({
            range: `${start.toString()},${end.toString()}`
        })
    }
  }
}());
