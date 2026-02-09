'use strict';

define('forum/category', [], function () {
var Category = {};

Category.init = function () {
itFilterTabs();
};

function initFilterTabs() {
urlParams = new URLSearchParams(window.location.search);
currentAnswered = urlParams.get('answered'); // 'true' | 'false' | null
tAnswered);

Filter').on('click.categoryFilter', function (e) {
tDefault();
$btn = $(this);
resolvedAttr = $btn.attr('data-resolved');
filterType;
(typeof resolvedAttr !== 'undefined') {
(resolvedAttr === '' || resolvedAttr === null) {
pe = 'all';
else if (resolvedAttr === 'false') {
pe = 'unanswered';
else if (resolvedAttr === 'true') {
pe = 'answered';
else {
pe = 'all';
else {
pe = $btn.data('filter') || 'all';
Filter(filterType);
ction applyFilter(filterTypeOrResolved) {
answeredValue = '';
(filterTypeOrResolved === 'unanswered' || filterTypeOrResolved === 'false') {
sweredValue = 'false';
else if (filterTypeOrResolved === 'answered' || filterTypeOrResolved === 'true') {
sweredValue = 'true';
url = new URL(window.location.href);
(answeredValue === '') {
swered');
else {
swered', answeredValue);
sweredValue === '' ? null : answeredValue);
.go(url.pathname + url.search);
}

function updateActiveFilter(answeredParam) {
btn-primary').addClass('btn-outline-secondary');
activeFilter = 'all';
(answeredParam === 'false') {
= 'unanswered';
else if (answeredParam === 'true') {
= 'answered';
byFilterSel = '.filter-tab[data-filter="' + activeFilter + '"]';
resolvedVal = activeFilter === 'all' ? '' : (activeFilter === 'answered' ? 'true' : 'false');
byResolvedSel = '.filter-tab[data-resolved="' + resolvedVal + '"]';
FilterSel).add(byResolvedSel).addClass('active btn-primary').removeClass('btn-outline-secondary');
}

return Category;
});
